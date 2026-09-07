import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePhoneVerified } from "@/lib/auth";
import { isListingHost } from "@/lib/host";
import { resolveInterestsBySlugs } from "@/lib/interests";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const natureTagEnum = z.enum([
  "INDIVIDUAL",
  "GATHERING",
  "BUSINESS",
  "ORGANIZATION",
  "LARGE_EVENT",
]);

const updateListingSchema = z
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
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    recurrenceRule: z.string().nullable().optional(),
    capacity: z.union([z.number(), z.string()]).nullable().optional(),
    rsvpRequired: z.boolean().default(false),
    rsvpApprovalRequired: z.boolean().default(false),
    homeHosted: z.boolean().default(false),
    isPaid: z.boolean().default(false),
    priceMin: z.union([z.number(), z.string()]).nullable().optional(),
    priceMax: z.union([z.number(), z.string()]).nullable().optional(),
    natureTag: natureTagEnum,
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

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function parseCapacity(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  const { id } = await context.params;

  try {
    const listing = await db.listing.findUnique({
      where: { id },
      include: { interests: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const host = await isListingHost(listing.id, user.id);
    if (!host) {
      return NextResponse.json({ error: "Only the host can edit this listing" }, { status: 403 });
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Only active listings can be edited" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = updateListingSchema.parse(body);

    let interests;
    try {
      interests = await resolveInterestsBySlugs(data.interestSlugs);
    } catch (interestErr) {
      return NextResponse.json(
        { error: interestErr instanceof Error ? interestErr.message : "Select at least one interest" },
        { status: 400 }
      );
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

    const updated = await db.$transaction(async (tx) => {
      await tx.listingInterest.deleteMany({ where: { listingId: listing.id } });
      return tx.listing.update({
        where: { id: listing.id },
        data: {
          type: data.type,
          title: data.title,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          locationLabel: data.locationLabel,
          locationPrecision: data.locationPrecision,
          startsAt: parseOptionalDate(data.startsAt),
          endsAt: parseOptionalDate(data.endsAt),
          recurrenceRule: data.recurrenceRule?.trim() ? data.recurrenceRule.trim() : null,
          capacity: parseCapacity(data.capacity),
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
    });

    return NextResponse.json({ ok: true, slug: updated.slug, id: updated.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}
