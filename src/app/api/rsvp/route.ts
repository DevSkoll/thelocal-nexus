import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";

const rsvpSchema = z.object({
  listingId: z.string(),
  status: z.enum(["GOING", "INTERESTED"]),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = rsvpSchema.parse(body);

    const listing = await db.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.homeHosted && !isPhoneVerified(user)) {
      return NextResponse.json(
        { error: "Phone verification required for home-hosted events" },
        { status: 403 }
      );
    }

    const approved = !listing.rsvpApprovalRequired || data.status === "INTERESTED";

    const rsvp = await db.rsvp.upsert({
      where: {
        listingId_userId: { listingId: data.listingId, userId: user.id },
      },
      create: {
        listingId: data.listingId,
        userId: user.id,
        status: data.status,
        approved,
        message: data.message,
      },
      update: {
        status: data.status,
        approved,
        message: data.message,
      },
    });

    return NextResponse.json(rsvp);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 });
  }
}