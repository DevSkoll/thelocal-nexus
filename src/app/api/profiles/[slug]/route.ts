import { NextResponse } from "next/server";
import { getPublicProfileBySlug } from "@/lib/profiles";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const { slug } = await context.params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(profile);
}
