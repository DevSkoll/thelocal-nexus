import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isListingHost } from "@/lib/host";

const approveSchema = z.object({
  rsvpId: z.string(),
  approved: z.boolean(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = approveSchema.parse(body);

    const rsvp = await db.rsvp.findUnique({
      where: { id: data.rsvpId },
      include: { listing: true },
    });
    if (!rsvp) return NextResponse.json({ error: "RSVP not found" }, { status: 404 });

    const isHost = await isListingHost(rsvp.listingId, user.id);
    if (!isHost) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const updated = await db.rsvp.update({
      where: { id: data.rsvpId },
      data: { approved: data.approved },
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}