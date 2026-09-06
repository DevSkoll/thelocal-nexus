import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { updateOwnProfile } from "@/lib/profiles";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(),
  headline: z.string().max(120).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
});

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
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
