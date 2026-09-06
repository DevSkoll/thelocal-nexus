import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePhoneVerified } from "@/lib/auth";
import { createGroup, listGroups } from "@/lib/groups";

const createSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  type: z.enum(["COMMUNITY", "ORGANIZATION", "BUSINESS"]),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationLabel: z.string().max(120).optional().nullable(),
  coverImageUrl: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = sp.get("lat");
  const lng = sp.get("lng");
  const radius = sp.get("radiusMiles");
  const type = sp.get("type");

  const groups = await listGroups({
    lat: lat != null ? Number(lat) : undefined,
    lng: lng != null ? Number(lng) : undefined,
    radiusMiles: radius != null ? Number(radius) : undefined,
    type:
      type === "COMMUNITY" || type === "ORGANIZATION" || type === "BUSINESS"
        ? type
        : undefined,
    search: sp.get("q") ?? undefined,
  });

  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const rawCover = data.coverImageUrl?.trim() || "";
    let coverImageUrl: string | null = null;
    if (rawCover) {
      try {
        const u = new URL(rawCover);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          return NextResponse.json({ error: "Cover image must be an http(s) URL" }, { status: 400 });
        }
        coverImageUrl = rawCover;
      } catch {
        return NextResponse.json({ error: "Cover image must be a valid URL" }, { status: 400 });
      }
    }

    const group = await createGroup(user.id, {
      name: data.name.trim(),
      description: data.description.trim(),
      type: data.type,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      locationLabel: data.locationLabel?.trim() || null,
      coverImageUrl,
    });

    return NextResponse.json({ slug: group.slug, id: group.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
