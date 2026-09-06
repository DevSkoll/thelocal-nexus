import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const joinSchema = z.object({
  groupId: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = joinSchema.parse(body);

    const group = await db.group.findUnique({ where: { id: data.groupId } });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const existing = await db.groupMember.findUnique({
      where: { userId_groupId: { userId: user.id, groupId: data.groupId } },
    });
    if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

    const member = await db.groupMember.create({
      data: { userId: user.id, groupId: data.groupId, role: "MEMBER" },
      include: { group: true },
    });

    return NextResponse.json(member);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}