import { format, formatDistanceToNow } from "date-fns";
import { LISTING_TYPES, LISTING_NATURE_TAGS } from "./constants";
import type { ListingType, ListingNatureTag, VerificationTier, GroupVerification } from "@/generated/prisma/client";

export function formatListingType(type: ListingType): string {
  return LISTING_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function formatNatureTag(tag: ListingNatureTag): string {
  return LISTING_NATURE_TAGS.find((t) => t.value === tag)?.label ?? tag;
}

export function formatPriceRange(min: number | null, max: number | null): string | null {
  if (min == null) return null;
  const fmt = (n: number) =>
    n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
  const effectiveMax = max ?? min;
  if (effectiveMax === min) return fmt(min);
  return `${fmt(min)}–${fmt(effectiveMax)}`;
}

export function formatListingDate(
  startsAt: Date | null,
  endsAt: Date | null,
  recurrenceRule: string | null
): string {
  if (recurrenceRule) {
    const parts = recurrenceRule.split(":");
    const day = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";
    const time = parts[2] ? formatTime(parts[2]) : "";
    return `Every ${day}${time ? ` at ${time}` : ""}`;
  }
  if (!startsAt) return "Ongoing";
  const start = format(startsAt, "EEE, MMM d");
  const time = format(startsAt, "h:mm a");
  if (endsAt) {
    const endTime = format(endsAt, "h:mm a");
    return `${start} · ${time} – ${endTime}`;
  }
  return `${start} · ${time}`;
}

function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = mStr != null ? Number(mStr) : 0;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatVerification(
  tier: VerificationTier,
  opts?: { phoneVerifiedAt?: Date | null; emailVerifiedAt?: Date | null }
): string | null {
  if (tier === "VERIFIED_HOST") return "Verified host";
  if (opts?.phoneVerifiedAt) return "Phone verified";
  if (opts?.emailVerifiedAt) return "Email verified";
  return null;
}

export function formatVerificationBadges(user: {
  verificationTier: VerificationTier;
  phoneVerifiedAt: Date | null;
  emailVerifiedAt: Date | null;
}): string[] {
  const badges: string[] = [];
  if (user.phoneVerifiedAt) badges.push("Phone verified");
  if (user.emailVerifiedAt) badges.push("Email verified");
  if (user.verificationTier === "VERIFIED_HOST") badges.push("Verified host");
  return badges;
}

export function formatGroupVerification(verification: GroupVerification): string | null {
  return verification === "ESTABLISHED" ? "Established group" : null;
}

export function formatMemberSince(date: Date): string {
  return `Member since ${format(date, "MMM yyyy")}`;
}

export function formatFounded(date: Date): string {
  const years = Math.floor(
    (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  if (years < 1) return `Founded ${formatDistanceToNow(date, { addSuffix: true })}`;
  return `Established ${years}+ year${years > 1 ? "s" : ""}`;
}