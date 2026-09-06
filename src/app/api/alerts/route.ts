import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const alertSchema = z.object({
  interestSlug: z.string(),
  radiusMiles: z.number().int().min(5).max(50).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = alertSchema.parse(body);

    const interest = await db.interest.findUnique({ where: { slug: data.interestSlug } });
    if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });

    const alert = await db.alert.upsert({
      where: { userId_interestId: { userId: user.id, interestId: interest.id } },
      create: {
        userId: user.id,
        interestId: interest.id,
        radiusMiles: data.radiusMiles ?? user.radiusMiles,
      },
      update: { radiusMiles: data.radiusMiles ?? user.radiusMiles },
      include: { interest: true },
    });

    return NextResponse.json(alert);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const interestSlug = searchParams.get("interestSlug");
  if (!interestSlug) return NextResponse.json({ error: "interestSlug required" }, { status: 400 });

  const interest = await db.interest.findUnique({ where: { slug: interestSlug } });
  if (!interest) return NextResponse.json({ error: "Interest not found" }, { status: 404 });

  await db.alert.deleteMany({
    where: { userId: user.id, interestId: interest.id },
  });

  return NextResponse.json({ ok: true });
}