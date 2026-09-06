import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { requirePhoneVerified } from "@/lib/auth";

const natureTagEnum = z.enum([
  "INDIVIDUAL",
  "GATHERING",
  "BUSINESS",
  "ORGANIZATION",
  "LARGE_EVENT",
]);

const createListingSchema = z
  .object({
    type: z.enum([
      "ONE_TIME_EVENT",
      "RECURRING_EVENT",
      "GROUP_SEEKING",
      "HANGOUT_SPOT",
      "VOLUNTEER",
      "WORKSHOP",
      "LOOKING_FOR",
    ]),
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(5000),
    locationLabel: z.string().min(2),
    latitude: z.number(),
    longitude: z.number(),
    locationPrecision: z.enum(["EXACT", "APPROXIMATE", "NEIGHBORHOOD"]).default("APPROXIMATE"),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    recurrenceRule: z.string().optional(),
    capacity: z.string().optional(),
    rsvpRequired: z.boolean().default(false),
    rsvpApprovalRequired: z.boolean().default(false),
    homeHosted: z.boolean().default(false),
    isPaid: z.boolean().default(false),
    priceMin: z.union([z.number(), z.string()]).optional(),
    priceMax: z.union([z.number(), z.string()]).optional(),
    natureTag: natureTagEnum,
    posterType: z.enum(["PERSON", "GROUP", "ORGANIZATION"]).default("PERSON"),
    posterGroupId: z.string().optional(),
    interestSlugs: z.array(z.string()).min(1),
  })
  .superRefine((data, ctx) => {
    const min =
      data.priceMin != null && data.priceMin !== ""
        ? Number(data.priceMin)
        : null;
    const max =
      data.priceMax != null && data.priceMax !== ""
        ? Number(data.priceMax)
        : null;

    if (data.isPaid) {
      if (min == null || isNaN(min) || min < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price is required for paid events",
          path: ["priceMin"],
        });
      }
      const effectiveMax = max ?? min;
      if (min != null && effectiveMax != null && effectiveMax < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum price must be at least the minimum",
          path: ["priceMax"],
        });
      }
    }
  });

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requirePhoneVerified();
  if (authError || !user) return authError!;

  try {
    const body = await req.json();
    const data = createListingSchema.parse(body);

    const interests = await db.interest.findMany({
      where: { slug: { in: data.interestSlugs } },
    });

    if (interests.length === 0) {
      return NextResponse.json({ error: "Select at least one interest" }, { status: 400 });
    }

    let priceMin: number | null = null;
    let priceMax: number | null = null;
    if (data.isPaid) {
      priceMin =
        data.priceMin != null && data.priceMin !== ""
          ? Number(data.priceMin)
          : null;
      priceMax =
        data.priceMax != null && data.priceMax !== ""
          ? Number(data.priceMax)
          : priceMin;
    }

    let slug = slugify(data.title);
    const existing = await db.listing.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const listing = await db.listing.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        type: data.type,
        posterType: data.posterType,
        posterUserId: data.posterType === "PERSON" ? user.id : null,
        posterGroupId: data.posterGroupId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        locationLabel: data.locationLabel,
        locationPrecision: data.locationPrecision,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        recurrenceRule: data.recurrenceRule || null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        rsvpRequired: data.rsvpRequired,
        rsvpApprovalRequired: data.rsvpApprovalRequired,
        homeHosted: data.homeHosted,
        isPaid: data.isPaid,
        priceMin,
        priceMax,
        natureTag: data.natureTag,
        interests: {
          create: interests.map((i) => ({ interestId: i.id })),
        },
      },
    });

    return NextResponse.json({ slug: listing.slug, id: listing.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}