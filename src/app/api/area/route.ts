import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { geocodeZip } from "@/lib/geo/zip";
import { applyAreaToUser, setAreaCookie, type AreaPreference } from "@/lib/location";
import { DEFAULT_RADIUS_MILES } from "@/lib/constants";

const areaSchema = z.object({
  zipCode: z.string().min(5).max(10),
  radiusMiles: z.number().int().min(5).max(50).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = areaSchema.parse(body);

    const geo = await geocodeZip(data.zipCode);
    const pref: AreaPreference = {
      ...geo,
      radiusMiles: data.radiusMiles ?? DEFAULT_RADIUS_MILES,
      source: "zip",
    };

    await setAreaCookie(pref);

    const user = await getCurrentUser();
    if (user) {
      await applyAreaToUser(user.id, pref);
    }

    return NextResponse.json({ ok: true, area: pref });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update area" }, { status: 500 });
  }
}