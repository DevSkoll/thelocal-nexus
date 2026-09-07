import { mkdir, writeFile, unlink, access } from "fs/promises";
import { existsSync, constants as fsConstants } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Prefer UPLOAD_ROOT, then Docker /data volume, else ./data/uploads (local demo).
 * Map /data (or set UPLOAD_ROOT) as a volume in production so uploads survive restarts.
 */
export function getUploadRoot(): string {
  if (process.env.UPLOAD_ROOT) return process.env.UPLOAD_ROOT;
  if (existsSync("/data")) return "/data/uploads";
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");
}

export type UploadKind = "avatars" | "covers";

export function publicUrlFor(kind: UploadKind, filename: string): string {
  return `/uploads/${kind}/${filename}`;
}

export function resolveUploadPath(kind: UploadKind, filename: string): string {
  const safe = path.basename(filename);
  return path.join(getUploadRoot(), kind, safe);
}

export async function ensureUploadDirs() {
  const root = getUploadRoot();
  await mkdir(path.join(root, "avatars"), { recursive: true });
  await mkdir(path.join(root, "covers"), { recursive: true });
}

export function extensionForMime(mime: string): string | null {
  return EXT_BY_TYPE[mime] ?? null;
}

export async function saveImageUpload(
  kind: UploadKind,
  buffer: Buffer,
  mime: string
): Promise<{ filename: string; url: string }> {
  const ext = extensionForMime(mime);
  if (!ext) throw new Error("Unsupported image type");
  await ensureUploadDirs();
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const dest = resolveUploadPath(kind, filename);
  await writeFile(dest, buffer);
  return { filename, url: publicUrlFor(kind, filename) };
}

export async function deleteUploadIfLocal(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const parts = url.split("/").filter(Boolean);
  if (parts.length !== 3 || parts[0] !== "uploads") return;
  const kind = parts[1] as UploadKind;
  if (kind !== "avatars" && kind !== "covers") return;
  const filePath = resolveUploadPath(kind, parts[2]);
  try {
    await access(filePath, fsConstants.F_OK);
    await unlink(filePath);
  } catch {
    // ignore missing
  }
}

export function isAllowedImageMime(mime: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mime);
}
