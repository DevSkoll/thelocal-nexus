import { getAltcha, assertAltchaHmacConfigured } from "@/lib/altcha";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** POST — optional standalone ALTCHA payload verification (JSON body `{ altcha }`). */
export async function POST(req: Request) {
  const configured = await assertAltchaHmacConfigured();
  if (!configured.ok) {
    return NextResponse.json({ error: configured.error }, { status: 500 });
  }

  const altcha = await getAltcha();
  const result = await altcha.verifyHandler(req);
  const data = (await result.json()) as {
    error: string | null;
    verification: { verified?: boolean } | null;
  };

  if (data.error || !data.verification?.verified) {
    return NextResponse.json(
      { error: data.error ?? "ALTCHA verification failed", verified: false },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, verified: true });
}
