import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePhoneVerified } from "@/lib/auth";
import { applyEvent } from "@/lib/reputation";

const feedbackSchema = z
  .object({
    toUserId: z.string().min(1),
    listingId: z.string().optional(),
    skillOfferId: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    body: z.string().max(2000).optional(),
  })
  .refine((d) => d.listingId || d.skillOfferId, {
    message: "Provide a listingId or skillOfferId context",
  });

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = feedbackSchema.parse(body);

    if (data.toUserId === user.id) {
      return NextResponse.json({ error: "Cannot leave feedback for yourself" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id: data.toUserId } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (data.listingId) {
      const listing = await db.listing.findUnique({ where: { id: data.listingId } });
      if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

      const myRsvp = await db.rsvp.findUnique({
        where: { listingId_userId: { listingId: data.listingId, userId: user.id } },
      });
      const theirRsvp = await db.rsvp.findUnique({
        where: { listingId_userId: { listingId: data.listingId, userId: data.toUserId } },
      });
      const iAmHost = listing.posterUserId === user.id;
      const theyAreHost = listing.posterUserId === data.toUserId;
      const shared =
        (myRsvp && (theyAreHost || theirRsvp)) ||
        (iAmHost && theirRsvp);
      if (!shared) {
        return NextResponse.json(
          { error: "Feedback requires a shared listing RSVP or host relationship" },
          { status: 403 }
        );
      }
    }

    if (data.skillOfferId) {
      const offer = await db.skillOffer.findUnique({ where: { id: data.skillOfferId } });
      if (!offer) return NextResponse.json({ error: "Skill offer not found" }, { status: 404 });
      if (offer.userId !== data.toUserId && offer.userId !== user.id) {
        return NextResponse.json(
          { error: "Skill feedback must involve the offer owner" },
          { status: 403 }
        );
      }
    }

    const feedback = await db.feedback.create({
      data: {
        fromUserId: user.id,
        toUserId: data.toUserId,
        listingId: data.listingId ?? null,
        skillOfferId: data.skillOfferId ?? null,
        rating: data.rating,
        body: data.body ?? null,
      },
    });

    const reason = data.rating >= 4 ? "POSITIVE_FEEDBACK" : data.rating <= 2 ? "NEGATIVE_FEEDBACK" : null;
    if (reason) {
      await applyEvent({
        subjectUserId: data.toUserId,
        actorUserId: user.id,
        listingId: data.listingId,
        skillOfferId: data.skillOfferId,
        reason,
        note: data.body?.slice(0, 200) ?? null,
      });
    }

    if (data.skillOfferId && data.rating >= 4) {
      await applyEvent({
        subjectUserId: data.toUserId,
        actorUserId: user.id,
        skillOfferId: data.skillOfferId,
        reason: "SKILL_COMPLETED",
      });
    }

    return NextResponse.json(feedback);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    // Unique constraint — already left feedback for this context
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "You already left feedback for this context" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
