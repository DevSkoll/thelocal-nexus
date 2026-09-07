import {
  create,
  deriveHmacKeySecret,
  randomInt,
  CappedMap,
} from "altcha-lib/frameworks/nextjs";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { isTestOtpPhone } from "@/lib/sms";

/** Insecure local-dev only — never use this value in production. */
export const ALTCHA_DEV_FALLBACK_HMAC_KEY =
  "local-dev-insecure-altcha-hmac-key-do-not-use-in-prod";

const challengeStore = new CappedMap<string, boolean>({ maxSize: 10_000 });

export type AltchaInstance = ReturnType<typeof create>;

type Secrets = {
  hmacSecret: string;
  hmacKeySecret: string;
  usingDevFallback: boolean;
};

let secretsPromise: Promise<Secrets> | null = null;
let altchaPromise: Promise<AltchaInstance> | null = null;

function readHmacKey(): { key: string; usingDevFallback: boolean } {
  const fromEnv = process.env.ALTCHA_HMAC_KEY?.trim();
  if (fromEnv) {
    return { key: fromEnv, usingDevFallback: false };
  }
  return { key: ALTCHA_DEV_FALLBACK_HMAC_KEY, usingDevFallback: true };
}

async function getSecrets(): Promise<Secrets> {
  if (!secretsPromise) {
    secretsPromise = (async () => {
      const { key, usingDevFallback } = readHmacKey();
      if (usingDevFallback) {
        console.warn(
          "[altcha] ALTCHA_HMAC_KEY unset — using insecure local-dev fallback. Set ALTCHA_HMAC_KEY for any shared/demo/production host."
        );
      }
      return {
        hmacSecret: key,
        hmacKeySecret: await deriveHmacKeySecret(key),
        usingDevFallback,
      };
    })();
  }
  return secretsPromise;
}

/**
 * Reject requests in production when the HMAC key was not configured.
 * Safe during `next build` (no request) — only called from route handlers.
 */
export async function assertAltchaHmacConfigured(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const { usingDevFallback } = await getSecrets();
  if (usingDevFallback && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: "Server misconfigured: ALTCHA_HMAC_KEY is required in production",
    };
  }
  return { ok: true };
}

export async function getAltcha(): Promise<AltchaInstance> {
  if (!altchaPromise) {
    altchaPromise = (async () => {
      const { hmacSecret, hmacKeySecret } = await getSecrets();
      return create({
        hmacSignatureSecret: hmacSecret,
        hmacKeySignatureSecret: hmacKeySecret,
        createChallengeParameters: () => ({
          algorithm: "PBKDF2/SHA-256",
          cost: 5_000,
          counter: randomInt(5_000, 10_000),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        }),
        deriveKey,
        store: challengeStore,
      });
    })();
  }
  return altchaPromise;
}

/**
 * Narrow optional bypass for crew/test OTP phones.
 * Default OFF — prefer solving PoW (auto="onload") for automation.
 * Enable only with ALTCHA_BYPASS_TEST_PHONES=true.
 */
export function shouldBypassAltchaForPhone(phone: string): boolean {
  if (process.env.ALTCHA_BYPASS_TEST_PHONES !== "true") return false;
  return isTestOtpPhone(phone);
}

export async function verifyAltchaPayload(
  payload: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const configured = await assertAltchaHmacConfigured();
  if (!configured.ok) return configured;

  if (payload == null || payload === "") {
    return { ok: false, error: "ALTCHA verification required" };
  }
  if (typeof payload !== "string") {
    return { ok: false, error: "Invalid ALTCHA payload" };
  }

  const { hmacSecret, hmacKeySecret } = await getSecrets();
  const altcha = await getAltcha();
  const result = await altcha.verify(
    payload,
    deriveKey,
    hmacSecret,
    hmacKeySecret,
    challengeStore
  );

  if (result.error || !result.verification?.verified) {
    return {
      ok: false,
      error: result.error ?? "ALTCHA verification failed",
    };
  }
  return { ok: true };
}
