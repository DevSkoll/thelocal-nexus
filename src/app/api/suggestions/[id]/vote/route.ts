import { NextResponse } from "next/server";
import { requirePhoneVerified } from "@/lib/auth";
import { toggleVote } from "@/lib/suggestions";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  const { id } = await context.params;

  try {
    const result = await toggleVote(id, user.id);
    return NextResponse.json({
      ok: true,
      voted: result.voted,
      voteCount: result.suggestion.voteCount,
      id: result.suggestion.id,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Suggestion not found") {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 });
  }
}
