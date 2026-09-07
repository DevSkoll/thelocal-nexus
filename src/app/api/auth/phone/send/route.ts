import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { getSmsProvider, isMockSmsMode } from "@/lib/sms";
import {
  shouldBypassAltchaForPhone,
  verifyAltchaPayload,
} from "@/lib/altcha";

const sendSchema = z.object({
  phone: z.string().min(10).max(20),
  altcha: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone: raw, altcha } = sendSchema.parse(body);

    const phone = normalizePhone(raw);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid US phone number" }, { status: 400 });
    }

    if (!shouldBypassAltchaForPhone(phone)) {
      const verified = await verifyAltchaPayload(altcha);
      if (!verified.ok) {
        return NextResponse.json({ error: verified.error }, { status: 400 });
      }
    }

    const result = await getSmsProvider(phone).sendOtp(phone);

    return NextResponse.json({
      ok: true,
      phone,
      mock: isMockSmsMode(phone),
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
