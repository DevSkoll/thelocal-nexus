import { DEFAULT_RADIUS_MILES } from "./constants";

export const AREA_COOKIE = "thelocal_area";

export type AreaPreference = {
  zipCode: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  source: "ip" | "zip" | "user";
};

export function devFallback(): AreaPreference {
  return {
    zipCode: process.env.DEV_GEO_ZIP ?? "28301",
    locationLabel: process.env.DEV_GEO_LABEL ?? "Fayetteville, NC",
    latitude: parseFloat(process.env.DEV_GEO_LAT ?? "35.0527"),
    longitude: parseFloat(process.env.DEV_GEO_LNG ?? "-78.8784"),
    radiusMiles: DEFAULT_RADIUS_MILES,
    source: "ip",
  };
}

export function parseAreaCookie(value: string | undefined): AreaPreference | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as AreaPreference;
    if (
      parsed.zipCode &&
      parsed.locationLabel &&
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
    ) {
      return {
        ...parsed,
        radiusMiles: parsed.radiusMiles ?? DEFAULT_RADIUS_MILES,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function serializeAreaCookie(pref: AreaPreference): string {
  return JSON.stringify(pref);
}