import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { constants as fsConstants } from "fs";
import path from "path";
import { getUploadRoot } from "@/lib/uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;
  if (!segments || segments.length !== 2) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [kind, filename] = segments;
  if (kind !== "avatars" && kind !== "covers") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const safeName = path.basename(filename);
  if (safeName !== filename || filename.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(getUploadRoot(), kind, safeName);
  try {
    await access(filePath, fsConstants.R_OK);
    const buf = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
