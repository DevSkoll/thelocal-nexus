import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, requirePhoneVerified } from "@/lib/auth";
import { createSuggestion, listSuggestions } from "@/lib/suggestions";
import type { SuggestionStatus } from "@/generated/prisma/client";

const STATUSES = ["OPEN", "PLANNED", "DONE", "CLOSED"] as const;

const createSchema = z.object({
  title: z.string().min(5).max(120),
  body: z.string().min(10).max(5000),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const sort = sp.get("sort") === "top" ? "top" : "new";
  const statusParam = sp.get("status");
  const status: SuggestionStatus | "ALL" =
    statusParam && (STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as SuggestionStatus)
      : "ALL";

  const user = await getCurrentUser();
  const suggestions = await listSuggestions({
    sort,
    status,
    viewerId: user?.id,
  });

  return NextResponse.json({
    suggestions: suggestions.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      body: s.body,
      status: s.status,
      voteCount: s.voteCount,
      createdAt: s.createdAt.toISOString(),
      viewerHasVoted: s.viewerHasVoted,
      author: s.author,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const suggestion = await createSuggestion(user.id, {
      title: data.title.trim(),
      body: data.body.trim(),
    });

    return NextResponse.json({
      id: suggestion.id,
      slug: suggestion.slug,
      title: suggestion.title,
      status: suggestion.status,
      voteCount: suggestion.voteCount,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create suggestion" }, { status: 500 });
  }
}
