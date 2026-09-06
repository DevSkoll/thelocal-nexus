import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, requirePhoneVerified } from "@/lib/auth";

const messageSchema = z.object({
  listingId: z.string(),
  body: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const messages = await db.message.findMany({
    where: { listingId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requirePhoneVerified();
  if (authError || !user) return authError!;

  try {
    const body = await req.json();
    const data = messageSchema.parse(body);

    const listing = await db.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const message = await db.message.create({
      data: { listingId: data.listingId, userId: user.id, body: data.body },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(message);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}