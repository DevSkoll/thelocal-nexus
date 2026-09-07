import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getPublicTrustSummary } from "@/lib/reputation";
import { applyEvent } from "@/lib/reputation";

const OWN_PROFILE_SELECT = {
  id: true,
  slug: true,
  name: true,
  headline: true,
  bio: true,
  avatarUrl: true,
  coverImageUrl: true,
  pronouns: true,
  showRealName: true,
  showLocation: true,
  showSkills: true,
  showHostedListings: true,
  showReputation: true,
  showJoinDate: true,
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

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export type ProfileLinkInput = {
  label: string;
  url: string;
  sortOrder?: number;
};

export async function getPublicProfileBySlug(slug: string) {
  const user = await db.user.findUnique({
    where: { slug },
    select: {
      ...OWN_PROFILE_SELECT,
      interests: { include: { interest: true } },
      profileLinks: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
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

  const displayName = user.showRealName ? user.name : user.slug;
  const trust = user.showReputation ? await getPublicTrustSummary(user.id) : null;

  // Never expose phone/email on public profiles
  return {
    id: user.id,
    slug: user.slug,
    name: displayName,
    realNameHidden: !user.showRealName,
    headline: user.headline,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    coverImageUrl: user.coverImageUrl,
    pronouns: user.pronouns,
    locationLabel: user.showLocation ? user.locationLabel : null,
    verificationTier: user.verificationTier,
    reputationScore: user.showReputation ? user.reputationScore : null,
    phoneVerified: user.phoneVerifiedAt != null,
    memberSince: user.showJoinDate ? user.createdAt : null,
    links: user.profileLinks.map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      sortOrder: l.sortOrder,
    })),
    interests: user.interests.map((i) => i.interest),
    skillOffers: user.showSkills ? user.skillOffers : [],
    hostedListings: user.showHostedListings ? user.listings : [],
    trust,
    privacy: {
      showRealName: user.showRealName,
      showLocation: user.showLocation,
      showSkills: user.showSkills,
      showHostedListings: user.showHostedListings,
      showReputation: user.showReputation,
      showJoinDate: user.showJoinDate,
    },
  };
}

export type UpdateOwnProfileInput = {
  name?: string;
  slug?: string;
  headline?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  showRealName?: boolean;
  showLocation?: boolean;
  showSkills?: boolean;
  showHostedListings?: boolean;
  showReputation?: boolean;
  showJoinDate?: boolean;
  links?: ProfileLinkInput[];
};

export async function getOwnProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      ...OWN_PROFILE_SELECT,
      profileLinks: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
}

export async function updateOwnProfile(userId: string, input: UpdateOwnProfileInput) {
  const data: {
    name?: string;
    slug?: string;
    headline?: string | null;
    bio?: string | null;
    pronouns?: string | null;
    showRealName?: boolean;
    showLocation?: boolean;
    showSkills?: boolean;
    showHostedListings?: boolean;
    showReputation?: boolean;
    showJoinDate?: boolean;
  } = {};

  if (input.name != null) data.name = input.name.trim();
  if (input.headline !== undefined) data.headline = input.headline;
  if (input.bio !== undefined) data.bio = input.bio;
  if (input.pronouns !== undefined) data.pronouns = input.pronouns;
  if (input.showRealName !== undefined) data.showRealName = input.showRealName;
  if (input.showLocation !== undefined) data.showLocation = input.showLocation;
  if (input.showSkills !== undefined) data.showSkills = input.showSkills;
  if (input.showHostedListings !== undefined) data.showHostedListings = input.showHostedListings;
  if (input.showReputation !== undefined) data.showReputation = input.showReputation;
  if (input.showJoinDate !== undefined) data.showJoinDate = input.showJoinDate;

  if (input.slug != null) {
    const next = await ensureUniqueUserSlug(input.slug, userId);
    data.slug = next;
  }

  if (input.links !== undefined) {
    const normalized: ProfileLinkInput[] = [];
    for (let i = 0; i < input.links.length; i++) {
      const link = input.links[i];
      const label = link.label.trim().slice(0, 40);
      const url = link.url.trim();
      if (!label || !url) continue;
      if (!isHttpUrl(url)) {
        throw new Error(`Invalid URL for link "${label || "untitled"}"`);
      }
      normalized.push({ label, url, sortOrder: link.sortOrder ?? i });
    }
    if (normalized.length > 12) {
      throw new Error("At most 12 profile links");
    }

    await db.$transaction(async (tx) => {
      await tx.profileLink.deleteMany({ where: { userId } });
      if (normalized.length) {
        await tx.profileLink.createMany({
          data: normalized.map((l, i) => ({
            userId,
            label: l.label,
            url: l.url,
            sortOrder: l.sortOrder ?? i,
          })),
        });
      }
      await tx.user.update({
        where: { id: userId },
        data,
      });
    });
  } else {
    await db.user.update({
      where: { id: userId },
      data,
    });
  }

  const updated = await getOwnProfile(userId);
  if (!updated) throw new Error("Profile not found");

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

export async function updateOwnAvatar(userId: string, avatarUrl: string) {
  return db.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: OWN_PROFILE_SELECT,
  });
}

export async function updateOwnCover(userId: string, coverImageUrl: string) {
  return db.user.update({
    where: { id: userId },
    data: { coverImageUrl },
    select: OWN_PROFILE_SELECT,
  });
}
