import { cookies } from "next/headers";
import {
  AREA_COOKIE,
  type AreaPreference,
  devFallback,
  parseAreaCookie,
  serializeAreaCookie,
} from "./area-cookie";
import { getCurrentUser } from "./auth";

export type { AreaPreference } from "./area-cookie";
export { AREA_COOKIE, devFallback, parseAreaCookie, serializeAreaCookie };

export function areaFromUser(user: {
  zipCode: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusMiles: number;
}): AreaPreference | null {
  if (user.latitude == null || user.longitude == null) return null;
  return {
    zipCode: user.zipCode ?? "",
    locationLabel: user.locationLabel ?? "Your area",
    latitude: user.latitude,
    longitude: user.longitude,
    radiusMiles: user.radiusMiles,
    source: "user",
  };
}

export async function getAreaPreference(): Promise<AreaPreference> {
  const cookieStore = await cookies();
  const fromCookie = parseAreaCookie(cookieStore.get(AREA_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const user = await getCurrentUser();
  if (user) {
    const fromUser = areaFromUser(user);
    if (fromUser) return fromUser;
  }

  return devFallback();
}

export async function setAreaCookie(pref: AreaPreference): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AREA_COOKIE, serializeAreaCookie(pref), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function applyAreaToUser(
  userId: string,
  pref: AreaPreference
): Promise<void> {
  const { db } = await import("./db");
  await db.user.update({
    where: { id: userId },
    data: {
      zipCode: pref.zipCode,
      locationLabel: pref.locationLabel,
      latitude: pref.latitude,
      longitude: pref.longitude,
      radiusMiles: pref.radiusMiles,
    },
  });
}