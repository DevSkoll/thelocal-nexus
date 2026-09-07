/**
 * When hosts may mark a listing completed:
 * - If endsAt is set → after endsAt
 * - Else if startsAt is set → after startsAt
 * - Else (no schedule / ongoing) → anytime
 * Already-COMPLETED stays idempotent OK at the API layer.
 */
export function getListingCompletionEligibleAt(
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined
): Date | null {
  if (endsAt) return new Date(endsAt);
  if (startsAt) return new Date(startsAt);
  return null;
}

/** Null when completion is allowed; otherwise a host-facing error message. */
export function listingCompletionBlockReason(
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined,
  now: Date = new Date()
): string | null {
  const eligibleAt = getListingCompletionEligibleAt(startsAt, endsAt);
  if (!eligibleAt || Number.isNaN(eligibleAt.getTime())) return null;
  if (now.getTime() >= eligibleAt.getTime()) return null;
  if (endsAt) {
    return "This listing hasn't ended yet. You can mark it completed after it ends.";
  }
  return "This listing hasn't started yet. You can mark it completed after it begins.";
}
