import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getPublicTrustSummary } from "@/lib/reputation";
import { applyEvent } from "@/lib/reputation";

const PUBLIC_USER_SELECT = {
  id: true,
  slug: true,
  name: true,
  headline: true,
  bio: true,
  avatarUrl: true,
  locationLabel: true,
  verificationTier: true,
  reputationScore: true,
  phoneVerifiedAt: true,
  createdAt: true,
} as const;

export async function ensureUniqueUserSlug(base: string, excludeUserId?: string) {
  let slug = slugify(base) || "member";
  let candidate = slug;
  let n = 0;
  while (true) {
    const existing = await db.user.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeUserId) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

export async function getPublicProfileBySlug(slug: string) {
  const user = await db.user.findUnique({
    where: { slug },
    select: {
      ...PUBLIC_USER_SELECT,
      interests: { include: { interest: true } },
      skillOffers: {
        where: { status: "ACTIVE" },
        include: { interests: { include: { interest: true } } },
        orderBy: { createdAt: "desc" },
      },
      listings: {
        where: { status: "ACTIVE" },
        include: {
          interests: { include: { interest: true } },
          rsvps: { where: { status: "GOING" } },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });

  if (!user) return null;

  const trust = await getPublicTrustSummary(user.id);

  // Never expose phone/email on public profiles
  return {
    id: user.id,
    slug: user.slug,
    name: user.name,
    headline: user.headline,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    locationLabel: user.locationLabel,
    verificationTier: user.verificationTier,
    reputationScore: user.reputationScore,
    phoneVerified: user.phoneVerifiedAt != null,
    memberSince: user.createdAt,
    interests: user.interests.map((i) => i.interest),
    skillOffers: user.skillOffers,
    hostedListings: user.listings,
    trust,
  };
}

export type UpdateOwnProfileInput = {
  name?: string;
  slug?: string;
  headline?: string | null;
  bio?: string | null;
};

export async function updateOwnProfile(userId: string, input: UpdateOwnProfileInput) {
  const data: {
    name?: string;
    slug?: string;
    headline?: string | null;
    bio?: string | null;
  } = {};

  if (input.name != null) data.name = input.name;
  if (input.headline !== undefined) data.headline = input.headline;
  if (input.bio !== undefined) data.bio = input.bio;

  if (input.slug != null) {
    const next = await ensureUniqueUserSlug(input.slug, userId);
    data.slug = next;
  }

  const updated = await db.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_SELECT,
  });

  // One-time profile completion bonus when headline + bio present
  if (updated.headline && updated.bio) {
    const already = await db.reputationEvent.findFirst({
      where: { subjectUserId: userId, reason: "PROFILE_COMPLETED" },
    });
    if (!already) {
      await applyEvent({
        subjectUserId: userId,
        reason: "PROFILE_COMPLETED",
        note: "Completed public profile",
      });
    }
  }

  return updated;
}
