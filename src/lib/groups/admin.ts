import { db } from "@/lib/db";
import type { GroupRole } from "@/generated/prisma/client";

/** Safe member shape for APIs/UI — never includes phone. */
export type GroupMemberPublic = {
  id: string;
  role: GroupRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
  const membership = await db.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
    select: { role: true },
  });
  return membership?.role === "ADMIN";
}

export async function requireGroupAdmin(userId: string, groupId: string) {
  const ok = await isGroupAdmin(userId, groupId);
  if (!ok) {
    throw new Error("Group admin access required");
  }
}

export async function getGroupBySlugForAdmin(slug: string) {
  return db.group.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      description: true,
    },
  });
}

export async function listGroupMembers(groupId: string): Promise<GroupMemberPublic[]> {
  return db.groupMember.findMany({
    where: { groupId },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, slug: true } },
    },
  });
}

async function countAdmins(groupId: string): Promise<number> {
  return db.groupMember.count({
    where: { groupId, role: "ADMIN" },
  });
}

export async function setMemberRole(
  groupId: string,
  targetUserId: string,
  role: GroupRole
): Promise<GroupMemberPublic> {
  const member = await db.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });
  if (!member) {
    throw new Error("Member not found");
  }

  if (member.role === "ADMIN" && role === "MEMBER") {
    const admins = await countAdmins(groupId);
    if (admins <= 1) {
      throw new Error("Cannot demote the last admin");
    }
  }

  return db.groupMember.update({
    where: { id: member.id },
    data: { role },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function removeGroupMember(
  groupId: string,
  targetUserId: string
): Promise<void> {
  const member = await db.groupMember.findUnique({
    where: { userId_groupId: { userId: targetUserId, groupId } },
  });
  if (!member) {
    throw new Error("Member not found");
  }

  if (member.role === "ADMIN") {
    const admins = await countAdmins(groupId);
    if (admins <= 1) {
      throw new Error("Cannot remove the last admin");
    }
  }

  await db.groupMember.delete({ where: { id: member.id } });
}
