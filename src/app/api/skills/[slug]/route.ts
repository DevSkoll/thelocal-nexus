import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePhoneVerified } from "@/lib/auth";
import { getSkillOfferBySlug, updateSkillOffer } from "@/lib/skills";

interface RouteContext {
  params: Promise<{ slug: string }>;
}


const optionalPrice = z.preprocess((val) => {
  if (val === "" || val === undefined) return null;
  return val;
}, z.coerce.number().min(0).nullable()).optional();

const patchSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(5000).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  locationLabel: z.string().max(120).optional().nullable(),
  radiusMiles: z.coerce.number().int().min(1).max(100).optional().nullable(),
  priceMin: optionalPrice,
  priceMax: optionalPrice,
  interestSlugs: z.array(z.string()).min(1).optional(),
});

export async function GET(_req: Request, context: RouteContext) {
  const { slug } = await context.params;
  const offer = await getSkillOfferBySlug(slug);
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(offer);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  const { slug } = await context.params;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);
    const result = await updateSkillOffer(slug, user.id, data);
    if (result.error === "not_found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (result.error === "forbidden") {
      return NextResponse.json({ error: "Only the owner can update this offer" }, { status: 403 });
    }
    return NextResponse.json(result.offer);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update skill offer" }, { status: 500 });
  }
}
