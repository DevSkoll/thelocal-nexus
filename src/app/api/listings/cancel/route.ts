import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePhoneVerified } from "@/lib/auth";
import { isListingHost } from "@/lib/host";

const cancelSchema = z.object({
  listingId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = cancelSchema.parse(body);

    const listing = await db.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const host = await isListingHost(listing.id, user.id);
    if (!host) {
      return NextResponse.json({ error: "Only the host can cancel a listing" }, { status: 403 });
    }

    if (listing.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Completed listings cannot be cancelled" },
        { status: 400 }
      );
    }

    if (listing.status !== "CANCELLED") {
      await db.listing.update({
        where: { id: listing.id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ ok: true, status: "CANCELLED" });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to cancel listing" }, { status: 500 });
  }
}
