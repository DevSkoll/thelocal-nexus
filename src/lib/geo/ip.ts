import type { AreaPreference } from "@/lib/area-cookie";
import { devFallback } from "@/lib/area-cookie";
import { DEFAULT_RADIUS_MILES } from "@/lib/constants";

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "unknown") return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) return true;
  return false;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}

export async function lookupIpLocation(ip: string): Promise<AreaPreference> {
  if (isPrivateIp(ip)) return devFallback();

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,lat,lon,city,regionName,zip`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return devFallback();

    const data = (await res.json()) as {
      status: string;
      lat?: number;
      lon?: number;
      city?: string;
      regionName?: string;
      zip?: string;
    };

    if (data.status !== "success" || data.lat == null || data.lon == null) {
      return devFallback();
    }

    const city = data.city ?? "Your area";
    const region = data.regionName ?? "";
    const locationLabel = region ? `${city}, ${region}` : city;

    return {
      zipCode: data.zip?.slice(0, 5) || process.env.DEV_GEO_ZIP || "00000",
      locationLabel,
      latitude: data.lat,
      longitude: data.lon,
      radiusMiles: DEFAULT_RADIUS_MILES,
      source: "ip",
    };
  } catch {
    return devFallback();
  }
}