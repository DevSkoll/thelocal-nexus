import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { requireModerator } from "@/lib/moderation";
import { getSuggestionById, updateSuggestionStatus } from "@/lib/suggestions";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["OPEN", "PLANNED", "DONE", "CLOSED"]),
});

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  const suggestion = await getSuggestionById(id, user?.id);
  if (!suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }
  return NextResponse.json({
    suggestion: {
      id: suggestion.id,
      slug: suggestion.slug,
      title: suggestion.title,
      body: suggestion.body,
      status: suggestion.status,
      voteCount: suggestion.voteCount,
      createdAt: suggestion.createdAt.toISOString(),
      viewerHasVoted: suggestion.viewerHasVoted,
      author: suggestion.author,
    },
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { user, error } = await requireModerator();
  if (error || !user) return error!;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);
    const existing = await getSuggestionById(id);
    if (!existing) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    const suggestion = await updateSuggestionStatus(id, data.status);
    return NextResponse.json({
      ok: true,
      suggestion: {
        id: suggestion.id,
        status: suggestion.status,
        title: suggestion.title,
        voteCount: suggestion.voteCount,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update suggestion" }, { status: 500 });
  }
}
