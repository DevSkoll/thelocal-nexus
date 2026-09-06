import { NextResponse } from "next/server";
import type { User } from "@/generated/prisma/client";
import { getCurrentUser } from "./auth";

/**
 * Demo-friendly moderator gate.
 *
 * A user is a moderator when:
 * 1. `User.isModerator` is true (Joe is seeded this way), OR
 * 2. Their id or slug appears in `MODERATOR_USER_IDS` (comma-separated cuids and/or slugs).
 *
 * Never expose phone numbers in moderation APIs or UI.
 */
export function parseModeratorAllowlist(): string[] {
  const raw = process.env.MODERATOR_USER_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isModerator(
  user: Pick<User, "id" | "slug" | "isModerator">
): boolean {
  if (user.isModerator) return true;
  const allowlist = parseModeratorAllowlist();
  if (allowlist.length === 0) return false;
  return allowlist.includes(user.id) || allowlist.includes(user.slug);
}

export async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  if (!isModerator(user)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Moderator access required" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
