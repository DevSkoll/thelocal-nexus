import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";
import type { User } from "@/generated/prisma/client";

const SESSION_COOKIE = "thelocal_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    include: { interests: { include: { interest: true } } },
  });
}

export function isPhoneVerified(user: Pick<User, "phoneVerifiedAt">): boolean {
  return user.phoneVerifiedAt != null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function requirePhoneVerified() {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };
  if (!isPhoneVerified(user!)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Phone verification required" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function setCurrentUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearCurrentUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}