import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { getSmsProvider, isMockSmsMode } from "@/lib/sms";

const sendSchema = z.object({
  phone: z.string().min(10).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone: raw } = sendSchema.parse(body);

    const phone = normalizePhone(raw);
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid US phone number" }, { status: 400 });
    }

    const result = await getSmsProvider().sendOtp(phone);

    return NextResponse.json({
      ok: true,
      phone,
      mock: isMockSmsMode(),
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