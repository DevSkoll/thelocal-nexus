import { db } from "./db";
import { haversineDistance } from "./utils";
import { DEFAULT_RADIUS_MILES } from "./constants";
import type { ListingType, ListingNatureTag } from "@/generated/prisma/client";

export type ListingFilters = {
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  type?: ListingType;
  interestSlug?: string;
  natureTag?: ListingNatureTag;
  isPaid?: boolean;
  search?: string;
};

export async function getListings(filters: ListingFilters = {}) {
  const {
    lat,
    lng,
    radiusMiles = DEFAULT_RADIUS_MILES,
    type,
    interestSlug,
    natureTag,
    isPaid,
    search,
  } = filters;

  const listings = await db.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(type ? { type } : {}),
      ...(natureTag ? { natureTag } : {}),
      ...(isPaid != null ? { isPaid } : {}),
      ...(interestSlug
        ? { interests: { some: { interest: { slug: interestSlug } } } }
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
    include: {
      interests: { include: { interest: true } },
      posterUser: true,
      posterGroup: true,
      rsvps: { where: { status: "GOING" } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (lat != null && lng != null) {
    return listings
      .map((listing) => ({
        ...listing,
        distance: haversineDistance(lat, lng, listing.latitude, listing.longitude),
      }))
      .filter((l) => l.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  }

  return listings.map((listing) => ({ ...listing, distance: undefined }));
}

export async function getListingBySlug(slug: string) {
  return db.listing.findUnique({
    where: { slug },
    include: {
      interests: { include: { interest: true } },
      posterUser: true,
      posterGroup: { include: { members: { include: { user: true } } } },
      rsvps: { include: { user: true }, orderBy: { createdAt: "asc" } },
      announcements: {
        include: { host: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function getGroupBySlug(slug: string) {
  return db.group.findUnique({
    where: { slug },
    include: {
      createdBy: true,
      members: { include: { user: true } },
      listings: {
        where: { status: "ACTIVE" },
        include: {
          interests: { include: { interest: true } },
          posterUser: true,
          posterGroup: true,
          rsvps: { where: { status: "GOING" } },
        },
        orderBy: { startsAt: "asc" },
      },
    },
  });
}