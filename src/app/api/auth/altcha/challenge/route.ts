import { getAltcha, assertAltchaHmacConfigured } from "@/lib/altcha";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET — issue a fresh self-hosted ALTCHA PoW challenge for the login widget. */
export async function GET(req: Request) {
  const configured = await assertAltchaHmacConfigured();
  if (!configured.ok) {
    return NextResponse.json({ error: configured.error }, { status: 500 });
  }

  const altcha = await getAltcha();
  return altcha.challengeHandler(req);
}
