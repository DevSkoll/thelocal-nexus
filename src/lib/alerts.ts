import { db } from "./db";
import { haversineDistance } from "./utils";
import { getAreaPreference } from "./location";

export async function getAlertMatches(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { alerts: { include: { interest: true } } },
  });
  if (!user || user.alerts.length === 0) return [];

  const area = await getAreaPreference();
  const lat = user.latitude ?? area.latitude;
  const lng = user.longitude ?? area.longitude;
  const defaultRadius = user.radiusMiles ?? area.radiusMiles;

  const interestIds = user.alerts.map((a) => a.interestId);
  const listings = await db.listing.findMany({
    where: {
      status: "ACTIVE",
      interests: { some: { interestId: { in: interestIds } } },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      interests: { include: { interest: true } },
      posterUser: true,
      posterGroup: true,
      rsvps: { where: { status: "GOING" } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return listings
    .map((listing) => {
      const matchingAlert = user.alerts.find((a) =>
        listing.interests.some((li) => li.interestId === a.interestId)
      );
      const radius = matchingAlert?.radiusMiles ?? defaultRadius;
      const distance = haversineDistance(
        lat,
        lng,
        listing.latitude,
        listing.longitude
      );
      return { listing, distance, radius, interest: matchingAlert?.interest };
    })
    .filter((m) => m.distance <= m.radius)
    .slice(0, 5);
}