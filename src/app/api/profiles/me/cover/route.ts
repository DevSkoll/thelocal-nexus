import { NextRequest, NextResponse } from "next/server";
import { requirePhoneVerified } from "@/lib/auth";
import { updateOwnCover } from "@/lib/profiles";
import {
  MAX_UPLOAD_BYTES,
  deleteUploadIfLocal,
  isAllowedImageMime,
  saveImageUpload,
} from "@/lib/uploads";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { user, error } = await requirePhoneVerified();
  if (error || !user) return error!;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!isAllowedImageMime(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const previous = await db.user.findUnique({
      where: { id: user.id },
      select: { coverImageUrl: true },
    });
    const saved = await saveImageUpload("covers", buffer, file.type);
    const updated = await updateOwnCover(user.id, saved.url);
    await deleteUploadIfLocal(previous?.coverImageUrl);
    return NextResponse.json({ ok: true, coverImageUrl: updated.coverImageUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to upload cover" }, { status: 500 });
  }
}
