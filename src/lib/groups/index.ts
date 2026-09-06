import { db } from "@/lib/db";
import { haversineDistance, slugify } from "@/lib/utils";
import type { GroupType } from "@/generated/prisma/client";

const groupListInclude = {
  members: true,
  _count: { select: { members: true, listings: true } },
} as const;

export type CreateGroupInput = {
  name: string;
  description: string;
  type: GroupType;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  coverImageUrl?: string | null;
};

export async function createGroup(userId: string, input: CreateGroupInput) {
  let slug = slugify(input.name) || "group";
  const existing = await db.group.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  return db.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        type: input.type,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        locationLabel: input.locationLabel ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        createdById: userId,
        members: {
          create: [{ userId, role: "ADMIN" }],
        },
      },
      include: {
        members: true,
      },
    });
    return group;
  });
}

export type ListGroupsOpts = {
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  type?: GroupType;
  search?: string;
};

export async function listGroups(opts: ListGroupsOpts = {}) {
  const { lat, lng, radiusMiles = 50, type, search } = opts;

  const groups = await db.group.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { locationLabel: { contains: search } },
            ],
          }
        : {}),
    },
    include: groupListInclude,
    orderBy: { createdAt: "desc" },
  });

  if (lat != null && lng != null) {
    return groups
      .map((group) => {
        const distance =
          group.latitude != null && group.longitude != null
            ? haversineDistance(lat, lng, group.latitude, group.longitude)
            : null;
        return { ...group, distance };
      })
      .filter((g) => g.distance == null || g.distance <= radiusMiles)
      .sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }

  return groups.map((group) => ({ ...group, distance: undefined as number | undefined }));
}
