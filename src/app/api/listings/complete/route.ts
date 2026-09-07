import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePhoneVerified } from "@/lib/auth";
import { isListingHost } from "@/lib/host";
import { listingCompletionBlockReason } from "@/lib/listing-completion";
import { awardListingCompletionReputation } from "@/lib/reputation";

const completeSchema = z.object({
  listingId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = completeSchema.parse(body);

    const listing = await db.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const host = await isListingHost(listing.id, user.id);
    if (!host) {
      return NextResponse.json({ error: "Only the host can mark a listing completed" }, { status: 403 });
    }

    if (listing.status === "CANCELLED") {
      return NextResponse.json({ error: "Cancelled listings cannot be completed" }, { status: 400 });
    }

    // Idempotent COMPLETED: allow re-award path without re-checking schedule.
    if (listing.status !== "COMPLETED") {
      const blockReason = listingCompletionBlockReason(listing.startsAt, listing.endsAt);
      if (blockReason) {
        return NextResponse.json(
          {
            error: blockReason,
            code: "TOO_EARLY",
            // Rule: after endsAt if set, else after startsAt; unscheduled = anytime.
          },
          { status: 400 }
        );
      }

      await db.listing.update({
        where: { id: listing.id },
        data: { status: "COMPLETED" },
      });
    }

    const reputation = await awardListingCompletionReputation(listing.id, user.id);
    if (reputation.error === "not_found") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      status: "COMPLETED",
      awarded: reputation.awarded,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to complete listing" }, { status: 500 });
  }
}
