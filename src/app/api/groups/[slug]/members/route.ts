import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePhoneVerified } from "@/lib/auth";
import {
  getGroupBySlugForAdmin,
  isGroupAdmin,
  listGroupMembers,
  removeGroupMember,
  setMemberRole,
} from "@/lib/groups/admin";

type RouteCtx = { params: Promise<{ slug: string }> };

async function loadAdminContext(slug: string, userId: string) {
  const group = await getGroupBySlugForAdmin(slug);
  if (!group) {
    return { group: null as null, error: NextResponse.json({ error: "Group not found" }, { status: 404 }) };
  }
  const admin = await isGroupAdmin(userId, group.id);
  if (!admin) {
    return {
      group: null as null,
      error: NextResponse.json({ error: "Group admin access required" }, { status: 403 }),
    };
  }
  return { group, error: null };
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { user, error: authError } = await requirePhoneVerified();
  if (authError || !user) return authError!;

  const { slug } = await ctx.params;
  const { group, error } = await loadAdminContext(slug, user.id);
  if (error || !group) return error!;

  const members = await listGroupMembers(group.id);
  return NextResponse.json({
    group: { id: group.id, slug: group.slug, name: group.name },
    members: members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  });
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { user, error: authError } = await requirePhoneVerified();
  if (authError || !user) return authError!;

  const { slug } = await ctx.params;
  const { group, error } = await loadAdminContext(slug, user.id);
  if (error || !group) return error!;

  try {
    const body = await req.json();
    const data = roleSchema.parse(body);
    const member = await setMemberRole(group.id, data.userId, data.role);
    return NextResponse.json({
      ok: true,
      member: {
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
        user: member.user,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error) {
      const status =
        e.message === "Member not found"
          ? 404
          : e.message.includes("last admin")
            ? 400
            : 400;
      return NextResponse.json({ error: e.message }, { status });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

const removeSchema = z.object({
  userId: z.string().min(1),
});

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { user, error: authError } = await requirePhoneVerified();
  if (authError || !user) return authError!;

  const { slug } = await ctx.params;
  const { group, error } = await loadAdminContext(slug, user.id);
  if (error || !group) return error!;

  try {
    const body = await req.json();
    const data = removeSchema.parse(body);
    await removeGroupMember(group.id, data.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error) {
      const status =
        e.message === "Member not found"
          ? 404
          : e.message.includes("last admin")
            ? 400
            : 400;
      return NextResponse.json({ error: e.message }, { status });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
