import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { SuggestionStatus } from "@/generated/prisma/client";

export type SuggestionSort = "new" | "top";

const authorSelect = {
  id: true,
  name: true,
  slug: true,
} as const;

const suggestionInclude = {
  author: { select: authorSelect },
} as const;

export type ListSuggestionsOpts = {
  sort?: SuggestionSort;
  status?: SuggestionStatus | "ALL";
  viewerId?: string | null;
};

export async function listSuggestions(opts: ListSuggestionsOpts = {}) {
  const sort: SuggestionSort = opts.sort === "top" ? "top" : "new";
  const status = opts.status ?? "ALL";

  const suggestions = await db.suggestion.findMany({
    where: status === "ALL" ? undefined : { status },
    include: suggestionInclude,
    orderBy:
      sort === "top"
        ? [{ voteCount: "desc" }, { createdAt: "desc" }]
        : [{ createdAt: "desc" }],
  });

  let votedIds = new Set<string>();
  if (opts.viewerId && suggestions.length > 0) {
    const votes = await db.suggestionVote.findMany({
      where: {
        userId: opts.viewerId,
        suggestionId: { in: suggestions.map((s) => s.id) },
      },
      select: { suggestionId: true },
    });
    votedIds = new Set(votes.map((v) => v.suggestionId));
  }

  return suggestions.map((s) => ({
    ...s,
    viewerHasVoted: votedIds.has(s.id),
  }));
}

export async function getSuggestionById(id: string, viewerId?: string | null) {
  const suggestion = await db.suggestion.findUnique({
    where: { id },
    include: suggestionInclude,
  });
  if (!suggestion) return null;

  let viewerHasVoted = false;
  if (viewerId) {
    const vote = await db.suggestionVote.findUnique({
      where: {
        suggestionId_userId: { suggestionId: id, userId: viewerId },
      },
    });
    viewerHasVoted = Boolean(vote);
  }

  return { ...suggestion, viewerHasVoted };
}

export type CreateSuggestionInput = {
  title: string;
  body: string;
};

export async function createSuggestion(authorId: string, input: CreateSuggestionInput) {
  let slug: string | null = slugify(input.title) || null;
  if (slug) {
    const existing = await db.suggestion.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
  }

  return db.suggestion.create({
    data: {
      slug,
      title: input.title,
      body: input.body,
      authorId,
    },
    include: suggestionInclude,
  });
}

/**
 * Single-upvote toggle: add vote if missing, remove if present.
 * Keeps voteCount in sync inside a transaction.
 */
export async function toggleVote(suggestionId: string, userId: string) {
  return db.$transaction(async (tx) => {
    const suggestion = await tx.suggestion.findUnique({
      where: { id: suggestionId },
      select: { id: true, voteCount: true },
    });
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    const existing = await tx.suggestionVote.findUnique({
      where: {
        suggestionId_userId: { suggestionId, userId },
      },
    });

    if (existing) {
      await tx.suggestionVote.delete({ where: { id: existing.id } });
      const updated = await tx.suggestion.update({
        where: { id: suggestionId },
        data: { voteCount: { decrement: 1 } },
        include: suggestionInclude,
      });
      // Guard against underflow from any race/legacy drift
      if (updated.voteCount < 0) {
        return {
          suggestion: await tx.suggestion.update({
            where: { id: suggestionId },
            data: { voteCount: 0 },
            include: suggestionInclude,
          }),
          voted: false,
        };
      }
      return { suggestion: updated, voted: false };
    }

    await tx.suggestionVote.create({
      data: { suggestionId, userId },
    });
    const updated = await tx.suggestion.update({
      where: { id: suggestionId },
      data: { voteCount: { increment: 1 } },
      include: suggestionInclude,
    });
    return { suggestion: updated, voted: true };
  });
}

export async function updateSuggestionStatus(
  suggestionId: string,
  status: SuggestionStatus
) {
  return db.suggestion.update({
    where: { id: suggestionId },
    data: { status },
    include: suggestionInclude,
  });
}
