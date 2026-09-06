import { db } from "./db";

export async function isListingHost(listingId: string, userId: string): Promise<boolean> {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: {
      posterGroup: {
        include: { members: { where: { userId, role: "ADMIN" } } },
      },
    },
  });
  if (!listing) return false;
  if (listing.posterUserId === userId) return true;
  if (listing.posterGroup?.members.length) return true;
  return false;
}

export async function getHostedListings(userId: string) {
  const adminGroups = await db.groupMember.findMany({
    where: { userId, role: "ADMIN" },
    select: { groupId: true },
  });
  const groupIds = adminGroups.map((g) => g.groupId);

  return db.listing.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ posterUserId: userId }, { posterGroupId: { in: groupIds } }],
    },
    include: {
      rsvps: { include: { user: true }, orderBy: { createdAt: "asc" } },
      interests: { include: { interest: true } },
      posterUser: true,
      posterGroup: true,
    },
    orderBy: { createdAt: "desc" },
  });
}