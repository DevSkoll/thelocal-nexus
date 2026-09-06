import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isListingHost } from "@/lib/host";

const announcementSchema = z.object({
  listingId: z.string(),
  body: z.string().min(1).max(500),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const announcements = await db.announcement.findMany({
    where: { listingId },
    include: { host: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = announcementSchema.parse(body);

    const isHost = await isListingHost(data.listingId, user.id);
    if (!isHost) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const announcement = await db.announcement.create({
      data: { listingId: data.listingId, hostId: user.id, body: data.body },
      include: { host: { select: { name: true } } },
    });

    return NextResponse.json(announcement);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to post announcement" }, { status: 500 });
  }
}