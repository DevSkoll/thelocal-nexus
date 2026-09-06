import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePhoneVerified } from "@/lib/auth";
import { createSkillOffer, listSkillOffers } from "@/lib/skills";

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationLabel: z.string().max(120).optional().nullable(),
  radiusMiles: z.number().int().min(1).max(100).optional().nullable(),
  priceMin: z.number().min(0).optional().nullable(),
  priceMax: z.number().min(0).optional().nullable(),
  interestSlugs: z.array(z.string()).min(1),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = sp.get("lat");
  const lng = sp.get("lng");
  const radius = sp.get("radiusMiles");
  const priceMin = sp.get("priceMin");
  const priceMax = sp.get("priceMax");
  const minReputation = sp.get("minReputation");

  const offers = await listSkillOffers({
    lat: lat != null ? Number(lat) : undefined,
    lng: lng != null ? Number(lng) : undefined,
    radiusMiles: radius != null ? Number(radius) : undefined,
    interestSlug: sp.get("interest") ?? undefined,
    priceMin: priceMin != null ? Number(priceMin) : undefined,
    priceMax: priceMax != null ? Number(priceMax) : undefined,
    minReputation: minReputation != null ? Number(minReputation) : undefined,
    search: sp.get("q") ?? undefined,
  });

  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    if (data.priceMin != null && data.priceMax != null && data.priceMax < data.priceMin) {
      return NextResponse.json({ error: "Maximum price must be at least the minimum" }, { status: 400 });
    }
    const offer = await createSkillOffer(user.id, data);
    return NextResponse.json({ slug: offer.slug, id: offer.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create skill offer" }, { status: 500 });
  }
}
