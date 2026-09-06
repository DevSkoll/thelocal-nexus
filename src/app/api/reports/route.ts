import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const reportSchema = z.object({
  listingId: z.string(),
  reason: z.enum(["SPAM", "SAFETY", "MISLEADING", "INAPPROPRIATE", "OTHER"]),
  details: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = reportSchema.parse(body);

    const report = await db.report.create({
      data: {
        listingId: data.listingId,
        reporterId: user.id,
        reason: data.reason,
        details: data.details,
      },
    });

    return NextResponse.json({ ok: true, id: report.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}