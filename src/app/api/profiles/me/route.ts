import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getOwnProfile, updateOwnProfile } from "@/lib/profiles";

const linkSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().url().max(500),
  sortOrder: z.number().int().min(0).max(99).optional(),
});

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Username must be lowercase letters, numbers, and hyphens")
    .optional(),
  headline: z.string().max(120).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  pronouns: z.string().max(40).nullable().optional(),
  showRealName: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showHostedListings: z.boolean().optional(),
  showReputation: z.boolean().optional(),
  showJoinDate: z.boolean().optional(),
  links: z.array(linkSchema).max(12).optional(),
});

export async function GET() {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;
  const profile = await getOwnProfile(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);
    const updated = await updateOwnProfile(user.id, data);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    if (e instanceof Error && (e.message.startsWith("Invalid URL") || e.message.startsWith("At most"))) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
