/**
 * In-memory OTP send rate limits for single-node Thor.
 *
 * Limits (checked after phone normalize + ALTCHA, before sendOtp):
 * - Per phone: max 1 send / 60s; max 5 sends / rolling 1 hour
 * - Per IP: max 10 sends / rolling 1 hour
 *
 * IP key uses getClientIp (x-forwarded-for first hop, else x-real-ip).
 * Multi-instance / multi-replica deployments need a shared store (e.g. Redis).
 */

const PHONE_MIN_INTERVAL_MS = 60_000;
const PHONE_MAX_PER_HOUR = 5;
const IP_MAX_PER_HOUR = 10;
const WINDOW_MS = 60 * 60 * 1000;
/** Cap distinct keys so a flood of unique phones/IPs cannot grow memory unboundedly. */
const MAX_KEYS = 10_000;

export const OTP_SEND_RATE_LIMITS = {
  phoneMinIntervalSeconds: PHONE_MIN_INTERVAL_MS / 1000,
  phoneMaxPerHour: PHONE_MAX_PER_HOUR,
  ipMaxPerHour: IP_MAX_PER_HOUR,
  windowSeconds: WINDOW_MS / 1000,
} as const;

type Bucket = number[];

/**
 * FIFO-capped map of key → send timestamps (same idea as ALTCHA CappedMap).
 */
class CappedTimestampMap {
  private map = new Map<string, Bucket>();

  get(key: string): Bucket {
    return this.map.get(key) ?? [];
  }

  set(key: string, timestamps: Bucket): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, timestamps);
    while (this.map.size > MAX_KEYS) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  /** Test helper — clear all buckets. */
  clear(): void {
    this.map.clear();
  }
}

const phoneBuckets = new CappedTimestampMap();
const ipBuckets = new CappedTimestampMap();

function prune(timestamps: Bucket, now: number): Bucket {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

function retryAfterSeconds(fromMs: number, now: number): number {
  return Math.max(1, Math.ceil((fromMs - now) / 1000));
}

export type OtpRateLimitResult =
  | { ok: true }
  | { ok: false; error: string; retryAfterSeconds: number };

/**
 * Check phone + IP limits and, if allowed, record this send attempt.
 * Call only after ALTCHA succeeds (or test-phone bypass).
 */
export function checkAndRecordOtpSend(opts: {
  phone: string;
  ip: string;
  now?: number;
}): OtpRateLimitResult {
  const now = opts.now ?? Date.now();
  const phoneKey = opts.phone;
  const ipKey = opts.ip || "unknown";

  const phoneTs = prune(phoneBuckets.get(phoneKey), now);
  if (phoneTs.length > 0) {
    const last = phoneTs[phoneTs.length - 1]!;
    const nextAllowed = last + PHONE_MIN_INTERVAL_MS;
    if (now < nextAllowed) {
      return {
        ok: false,
        error: "Too many code requests. Please wait before trying again.",
        retryAfterSeconds: retryAfterSeconds(nextAllowed, now),
      };
    }
  }
  if (phoneTs.length >= PHONE_MAX_PER_HOUR) {
    const oldestInWindow = phoneTs[0]!;
    return {
      ok: false,
      error: "Too many code requests. Please wait before trying again.",
      retryAfterSeconds: retryAfterSeconds(oldestInWindow + WINDOW_MS, now),
    };
  }

  const ipTs = prune(ipBuckets.get(ipKey), now);
  if (ipTs.length >= IP_MAX_PER_HOUR) {
    const oldestInWindow = ipTs[0]!;
    return {
      ok: false,
      error: "Too many code requests. Please wait before trying again.",
      retryAfterSeconds: retryAfterSeconds(oldestInWindow + WINDOW_MS, now),
    };
  }

  phoneTs.push(now);
  ipTs.push(now);
  phoneBuckets.set(phoneKey, phoneTs);
  ipBuckets.set(ipKey, ipTs);
  return { ok: true };
}

/** Test / diagnostics — reset in-memory buckets. */
export function resetOtpSendRateLimitsForTests(): void {
  phoneBuckets.clear();
  ipBuckets.clear();
}
