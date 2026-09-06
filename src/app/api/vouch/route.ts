import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePhoneVerified } from "@/lib/auth";
import { createVouch } from "@/lib/reputation";

const vouchSchema = z
  .object({
    toUserId: z.string().min(1).optional(),
    toSlug: z.string().min(1).optional(),
  })
  .refine((d) => d.toUserId || d.toSlug, { message: "Provide toUserId or toSlug" });

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = vouchSchema.parse(body);

    let subjectId = data.toUserId;
    if (!subjectId && data.toSlug) {
      const target = await db.user.findUnique({
        where: { slug: data.toSlug },
        select: { id: true },
      });
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
      subjectId = target.id;
    }

    const result = await createVouch(user.id, subjectId!);
    if (result.error === "self") {
      return NextResponse.json({ error: "You cannot vouch for yourself" }, { status: 400 });
    }
    if (result.error === "not_found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (result.error === "duplicate") {
      return NextResponse.json({ error: "You already vouched for this person" }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      reputationScore: result.reputationScore,
      trust: result.trust,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to vouch" }, { status: 500 });
  }
}
