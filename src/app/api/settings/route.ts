import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { geocodeZip } from "@/lib/geo/zip";
import { setAreaCookie, type AreaPreference } from "@/lib/location";

const settingsSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  zipCode: z.string().min(5).max(10).optional(),
  radiusMiles: z.number().int().min(5).max(50).optional(),
  interestSlugs: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);

    if (data.interestSlugs) {
      const interests = await db.interest.findMany({
        where: { slug: { in: data.interestSlugs } },
      });
      await db.userInterest.deleteMany({ where: { userId: user.id } });
      if (interests.length > 0) {
        await db.userInterest.createMany({
          data: interests.map((i) => ({ userId: user.id, interestId: i.id })),
        });
      }
    }

    let locationUpdate: {
      zipCode?: string;
      locationLabel?: string;
      latitude?: number;
      longitude?: number;
      radiusMiles?: number;
    } = {};

    if (data.zipCode) {
      const geo = await geocodeZip(data.zipCode);
      locationUpdate = {
        zipCode: geo.zipCode,
        locationLabel: geo.locationLabel,
        latitude: geo.latitude,
        longitude: geo.longitude,
        ...(data.radiusMiles != null ? { radiusMiles: data.radiusMiles } : {}),
      };

      const pref: AreaPreference = {
        ...geo,
        radiusMiles: data.radiusMiles ?? user.radiusMiles,
        source: "user",
      };
      await setAreaCookie(pref);
    } else if (data.radiusMiles != null) {
      locationUpdate.radiusMiles = data.radiusMiles;
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(data.name != null ? { name: data.name } : {}),
        ...locationUpdate,
      },
      include: { interests: { include: { interest: true } } },
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}