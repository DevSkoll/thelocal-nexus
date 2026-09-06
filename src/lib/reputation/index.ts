import { db } from "@/lib/db";
import type { ReputationReason } from "@/generated/prisma/client";
import {
  REPUTATION_POINTS,
  VERIFIED_HOST_THRESHOLD,
  type ReputationReasonKey,
} from "./constants";

export { REPUTATION_POINTS, VERIFIED_HOST_THRESHOLD };

export type ApplyEventInput = {
  subjectUserId: string;
  actorUserId?: string | null;
  listingId?: string | null;
  skillOfferId?: string | null;
  reason: ReputationReason | ReputationReasonKey;
  points?: number;
  note?: string | null;
};

export async function applyEvent(input: ApplyEventInput) {
  const reason = input.reason as ReputationReasonKey;
  const points = input.points ?? REPUTATION_POINTS[reason] ?? 0;

  const event = await db.reputationEvent.create({
    data: {
      subjectUserId: input.subjectUserId,
      actorUserId: input.actorUserId ?? null,
      listingId: input.listingId ?? null,
      skillOfferId: input.skillOfferId ?? null,
      reason: reason as ReputationReason,
      points,
      note: input.note ?? null,
    },
  });

  const updated = await db.user.update({
    where: { id: input.subjectUserId },
    data: {
      reputationScore: { increment: points },
      reputationUpdatedAt: new Date(),
    },
  });

  await maybePromoteVerifiedHost(updated.id);

  const fresh = await db.user.findUnique({
    where: { id: input.subjectUserId },
    select: { reputationScore: true },
  });

  return { event, reputationScore: fresh?.reputationScore ?? updated.reputationScore };
}

/** Apply only if no matching ledger row exists (idempotent awards). */
export async function applyEventOnce(
  input: ApplyEventInput & {
    matchActor?: boolean;
    matchListing?: boolean;
  }
) {
  const reason = input.reason as ReputationReason;
  const existing = await db.reputationEvent.findFirst({
    where: {
      subjectUserId: input.subjectUserId,
      reason,
      ...(input.matchActor
        ? { actorUserId: input.actorUserId ?? null }
        : {}),
      ...(input.matchListing
        ? { listingId: input.listingId ?? null }
        : {}),
    },
  });
  if (existing) {
    return { event: existing, reputationScore: null as number | null, skipped: true as const };
  }
  const result = await applyEvent(input);
  return { ...result, skipped: false as const };
}

async function maybePromoteVerifiedHost(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;
  if (user.verificationTier === "VERIFIED_HOST") return;
  if (!user.phoneVerifiedAt) return;
  if (user.reputationScore < VERIFIED_HOST_THRESHOLD) return;

  await db.user.update({
    where: { id: userId },
    data: { verificationTier: "VERIFIED_HOST" },
  });
}

export type PublicTrustSummary = {
  score: number;
  eventCount: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  vouchCount: number;
  isVerifiedHost: boolean;
  phoneVerified: boolean;
};

export async function getPublicTrustSummary(userId: string): Promise<PublicTrustSummary> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      reputationScore: true,
      verificationTier: true,
      phoneVerifiedAt: true,
    },
  });

  if (!user) {
    return {
      score: 0,
      eventCount: 0,
      positiveFeedbackCount: 0,
      negativeFeedbackCount: 0,
      vouchCount: 0,
      isVerifiedHost: false,
      phoneVerified: false,
    };
  }

  const [eventCount, positiveFeedbackCount, negativeFeedbackCount, vouchCount] = await Promise.all([
    db.reputationEvent.count({ where: { subjectUserId: userId } }),
    db.reputationEvent.count({ where: { subjectUserId: userId, reason: "POSITIVE_FEEDBACK" } }),
    db.reputationEvent.count({ where: { subjectUserId: userId, reason: "NEGATIVE_FEEDBACK" } }),
    db.reputationEvent.count({ where: { subjectUserId: userId, reason: "VOUCH" } }),
  ]);

  return {
    score: user.reputationScore,
    eventCount,
    positiveFeedbackCount,
    negativeFeedbackCount,
    vouchCount,
    isVerifiedHost: user.verificationTier === "VERIFIED_HOST",
    phoneVerified: user.phoneVerifiedAt != null,
  };
}

export async function hasVouched(actorUserId: string, subjectUserId: string) {
  const existing = await db.reputationEvent.findFirst({
    where: {
      actorUserId,
      subjectUserId,
      reason: "VOUCH",
    },
  });
  return !!existing;
}

/** Peer vouch — once per actor→subject pair. */
export async function createVouch(actorUserId: string, subjectUserId: string) {
  if (actorUserId === subjectUserId) {
    return { error: "self" as const };
  }

  const subject = await db.user.findUnique({ where: { id: subjectUserId } });
  if (!subject) return { error: "not_found" as const };

  if (await hasVouched(actorUserId, subjectUserId)) {
    return { error: "duplicate" as const };
  }

  const result = await applyEvent({
    subjectUserId,
    actorUserId,
    reason: "VOUCH",
    note: "Peer vouch",
  });

  const trust = await getPublicTrustSummary(subjectUserId);
  return { error: null, ...result, trust };
}

/**
 * When a listing is marked COMPLETED: award EVENT_HOSTED to the host and
 * EVENT_COMPLETED to approved GOING attendees. Idempotent per listing+user+reason.
 */
export async function awardListingCompletionReputation(listingId: string, actingHostId: string) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: {
      rsvps: {
        where: { status: "GOING", approved: true },
        select: { userId: true },
      },
    },
  });
  if (!listing) return { error: "not_found" as const };

  const hostUserId = listing.posterUserId ?? actingHostId;
  const awarded: { reason: ReputationReasonKey; userId: string; skipped: boolean }[] = [];

  const hostResult = await applyEventOnce({
    subjectUserId: hostUserId,
    actorUserId: actingHostId,
    listingId,
    reason: "EVENT_HOSTED",
    note: `Hosted listing ${listing.slug}`,
    matchListing: true,
  });
  awarded.push({ reason: "EVENT_HOSTED", userId: hostUserId, skipped: hostResult.skipped });

  for (const rsvp of listing.rsvps) {
    if (rsvp.userId === hostUserId) continue;
    const attendeeResult = await applyEventOnce({
      subjectUserId: rsvp.userId,
      actorUserId: actingHostId,
      listingId,
      reason: "EVENT_COMPLETED",
      note: `Completed listing ${listing.slug}`,
      matchListing: true,
    });
    awarded.push({
      reason: "EVENT_COMPLETED",
      userId: rsvp.userId,
      skipped: attendeeResult.skipped,
    });
  }

  return { error: null, awarded };
}
