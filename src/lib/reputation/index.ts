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
