import { db } from "@/lib/db";
import { haversineDistance, slugify } from "@/lib/utils";
import { DEFAULT_RADIUS_MILES } from "@/lib/constants";
import type { SkillOfferStatus } from "@/generated/prisma/client";

export type SkillFilters = {
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  interestSlug?: string;
  priceMin?: number;
  priceMax?: number;
  minReputation?: number;
  search?: string;
  status?: SkillOfferStatus;
};

const skillInclude = {
  interests: { include: { interest: true } },
  user: {
    select: {
      id: true,
      slug: true,
      name: true,
      headline: true,
      verificationTier: true,
      reputationScore: true,
      phoneVerifiedAt: true,
      locationLabel: true,
    },
  },
} as const;

export async function listSkillOffers(filters: SkillFilters = {}) {
  const {
    lat,
    lng,
    radiusMiles = DEFAULT_RADIUS_MILES,
    interestSlug,
    priceMin,
    priceMax,
    minReputation,
    search,
    status = "ACTIVE",
  } = filters;

  const offers = await db.skillOffer.findMany({
    where: {
      status,
      ...(interestSlug
        ? { interests: { some: { interest: { slug: interestSlug } } } }
        : {}),
      ...(priceMin != null ? { OR: [{ priceMax: null }, { priceMax: { gte: priceMin } }, { priceMin: { gte: priceMin } }] } : {}),
      ...(priceMax != null ? { OR: [{ priceMin: null }, { priceMin: { lte: priceMax } }] } : {}),
      ...(minReputation != null
        ? { user: { reputationScore: { gte: minReputation } } }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { locationLabel: { contains: search } },
            ],
          }
        : {}),
    },
    include: skillInclude,
    orderBy: { createdAt: "desc" },
  });

  // Default sort: distance when location given, else recency. NEVER reputation alone.
  if (lat != null && lng != null) {
    return offers
      .map((offer) => {
        const hasCoords = offer.latitude != null && offer.longitude != null;
        const distance = hasCoords
          ? haversineDistance(lat, lng, offer.latitude!, offer.longitude!)
          : Number.POSITIVE_INFINITY;
        return { ...offer, distance: hasCoords ? distance : undefined };
      })
      .filter((o) => o.distance == null || o.distance <= radiusMiles)
      .sort((a, b) => {
        const da = a.distance ?? Number.POSITIVE_INFINITY;
        const db_ = b.distance ?? Number.POSITIVE_INFINITY;
        if (da !== db_) return da - db_;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  return offers.map((offer) => ({ ...offer, distance: undefined as number | undefined }));
}

export async function getSkillOfferBySlug(slug: string) {
  return db.skillOffer.findUnique({
    where: { slug },
    include: skillInclude,
  });
}

export type CreateSkillOfferInput = {
  title: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  radiusMiles?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  interestSlugs: string[];
};

export async function createSkillOffer(userId: string, input: CreateSkillOfferInput) {
  const interests = await db.interest.findMany({
    where: { slug: { in: input.interestSlugs } },
  });
  if (interests.length === 0) throw new Error("Select at least one interest");

  let slug = slugify(input.title);
  const existing = await db.skillOffer.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  return db.skillOffer.create({
    data: {
      slug,
      userId,
      title: input.title,
      description: input.description,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      locationLabel: input.locationLabel ?? null,
      radiusMiles: input.radiusMiles ?? null,
      priceMin: input.priceMin ?? null,
      priceMax: input.priceMax ?? null,
      interests: { create: interests.map((i) => ({ interestId: i.id })) },
    },
    include: skillInclude,
  });
}

export type UpdateSkillOfferInput = {
  title?: string;
  description?: string;
  status?: SkillOfferStatus;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  radiusMiles?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  interestSlugs?: string[];
};

export async function updateSkillOffer(
  slug: string,
  userId: string,
  input: UpdateSkillOfferInput
) {
  const offer = await db.skillOffer.findUnique({ where: { slug } });
  if (!offer) return { error: "not_found" as const };
  if (offer.userId !== userId) return { error: "forbidden" as const };

  if (input.interestSlugs) {
    const interests = await db.interest.findMany({
      where: { slug: { in: input.interestSlugs } },
    });
    await db.skillOfferInterest.deleteMany({ where: { skillOfferId: offer.id } });
    if (interests.length > 0) {
      await db.skillOfferInterest.createMany({
        data: interests.map((i) => ({ skillOfferId: offer.id, interestId: i.id })),
      });
    }
  }

  const updated = await db.skillOffer.update({
    where: { id: offer.id },
    data: {
      ...(input.title != null ? { title: input.title } : {}),
      ...(input.description != null ? { description: input.description } : {}),
      ...(input.status != null ? { status: input.status } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      ...(input.locationLabel !== undefined ? { locationLabel: input.locationLabel } : {}),
      ...(input.radiusMiles !== undefined ? { radiusMiles: input.radiusMiles } : {}),
      ...(input.priceMin !== undefined ? { priceMin: input.priceMin } : {}),
      ...(input.priceMax !== undefined ? { priceMax: input.priceMax } : {}),
    },
    include: skillInclude,
  });

  return { offer: updated };
}
