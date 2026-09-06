import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { setCurrentUser } from "@/lib/auth";
import { maskPhone, normalizePhone } from "@/lib/phone";
import { getSmsProvider } from "@/lib/sms";
import { slugify } from "@/lib/utils";
import { AREA_COOKIE, parseAreaCookie } from "@/lib/area-cookie";

const verifySchema = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().length(6),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = verifySchema.parse(body);

    const phone = normalizePhone(data.phone);
    if (!phone) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const valid = await getSmsProvider().checkOtp(phone, data.code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const now = new Date();
    const existing = await db.user.findUnique({ where: { phone } });
    const isNew = !existing;

    const cookieStore = await cookies();
    const areaFromCookie = parseAreaCookie(cookieStore.get(AREA_COOKIE)?.value);
    const locationData =
      isNew && areaFromCookie
        ? {
            zipCode: areaFromCookie.zipCode,
            locationLabel: areaFromCookie.locationLabel,
            latitude: areaFromCookie.latitude,
            longitude: areaFromCookie.longitude,
            radiusMiles: areaFromCookie.radiusMiles,
          }
        : {};

    const user = existing
      ? await db.user.update({
          where: { id: existing.id },
          data: {
            phoneVerifiedAt: now,
            ...(data.name?.trim() ? { name: data.name.trim() } : {}),
          },
        })
      : await db.user.create({
          data: {
            phone,
            phoneVerifiedAt: now,
            name: data.name?.trim() || maskPhone(phone),
            slug: slugify(data.name?.trim() || maskPhone(phone)) || ("member-" + Date.now().toString(36)),
            ...locationData,
          },
        });

    await setCurrentUser(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        isNew: isNew && user.name === maskPhone(phone),
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}