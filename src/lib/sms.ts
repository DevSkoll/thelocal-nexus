import { createHash, randomInt } from "crypto";
import { db } from "./db";

export interface SmsProvider {
  sendOtp(phone: string): Promise<{ sid: string; devCode?: string }>;
  checkOtp(phone: string, code: string): Promise<boolean>;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Reserved E.164 range for bot/crew demo logins — never receive real SMS. */
const TEST_OTP_PHONE_RE = /^\+15551001\d{3}$/;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function twilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

/**
 * Phones that always use the mock OTP path (hashed code in DB, optional devCode
 * in API). Matches `+15551001xxx` or comma-separated `TEST_OTP_PHONES`.
 * These numbers never receive SMS, even when Twilio is configured.
 */
export function isTestOtpPhone(phone: string): boolean {
  if (TEST_OTP_PHONE_RE.test(phone)) return true;
  const extra = process.env.TEST_OTP_PHONES;
  if (!extra) return false;
  return extra
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .includes(phone);
}

class TwilioVerifyProvider implements SmsProvider {
  private baseUrl: string;
  private authHeader: string;
  private serviceSid: string;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    this.serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
    this.baseUrl = `https://verify.twilio.com/v2/Services/${this.serviceSid}`;
    this.authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
  }

  async sendOtp(phone: string): Promise<{ sid: string }> {
    const res = await fetch(`${this.baseUrl}/Verifications`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, Channel: "sms" }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Twilio send failed: ${err}`);
    }
    const data = (await res.json()) as { sid: string };
    return { sid: data.sid };
  }

  async checkOtp(phone: string, code: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/VerificationCheck`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, Code: code }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status: string };
    return data.status === "approved";
  }
}

class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string): Promise<{ sid: string; devCode?: string }> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await db.phoneOtpChallenge.deleteMany({ where: { phone } });
    await db.phoneOtpChallenge.create({
      data: { phone, codeHash: hashCode(code), expiresAt },
    });

    console.log(`[mock-sms] OTP for ${phone}: ${code}`);

    const result: { sid: string; devCode?: string } = { sid: `mock-${Date.now()}` };
    // Always return code for reserved test phones (bots can login in production).
    // In development, return for all mock sends.
    if (process.env.NODE_ENV === "development" || isTestOtpPhone(phone)) {
      result.devCode = code;
    }
    return result;
  }

  async checkOtp(phone: string, code: string): Promise<boolean> {
    const challenge = await db.phoneOtpChallenge.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
    if (!challenge) return false;
    if (challenge.expiresAt < new Date()) return false;
    if (challenge.attempts >= MAX_ATTEMPTS) return false;

    const valid = challenge.codeHash === hashCode(code);
    await db.phoneOtpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: challenge.attempts + 1 },
    });

    if (valid) {
      await db.phoneOtpChallenge.deleteMany({ where: { phone } });
    }
    return valid;
  }
}

const mockProvider = new MockSmsProvider();
let twilioProvider: SmsProvider | null = null;

function getTwilioProvider(): SmsProvider {
  if (!twilioProvider) {
    twilioProvider = new TwilioVerifyProvider();
  }
  return twilioProvider;
}

/** Provider for a specific phone — test OTP phones always use mock. */
export function getSmsProvider(phone?: string): SmsProvider {
  if (phone && isTestOtpPhone(phone)) {
    return mockProvider;
  }
  if (twilioConfigured()) {
    return getTwilioProvider();
  }
  return mockProvider;
}

export function isMockSmsMode(phone?: string): boolean {
  if (phone && isTestOtpPhone(phone)) return true;
  return !twilioConfigured();
}
