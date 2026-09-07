"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AltchaWidget } from "@/components/auth/altcha-widget";

type Step = "phone" | "otp" | "name";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  const [altchaKey, setAltchaKey] = useState(0);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!altchaPayload) {
      setError("Complete the quick bot check before sending a code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, altcha: altchaPayload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send code");
        // Force a fresh PoW challenge after a failed send
        setAltchaPayload(null);
        setAltchaKey((k) => k + 1);
        return;
      }
      setNormalizedPhone(data.phone);
      setMockMode(data.mock);
      setDevCode(data.devCode ?? null);
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed");
        return;
      }
      if (data.user?.isNew) {
        // Cookie is set; refresh the server Header while they pick a display name.
        router.refresh();
        setStep("name");
        return;
      }
      // Full navigation so the layout Header re-reads the session cookie.
      window.location.assign("/discover");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetName(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save name");
        return;
      }
      window.location.assign("/discover");
    } finally {
      setLoading(false);
    }
  }

  if (step === "name") {
    return (
      <form onSubmit={handleSetName} className="space-y-4">
        <p className="text-sm text-ink-muted">
          What should neighbors call you? This is a display name — not your legal name.
        </p>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
          required
          autoFocus
        />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <Button type="submit" disabled={loading || !name.trim()} className="w-full">
          {loading ? "Saving..." : "Continue"}
        </Button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerify} className="space-y-4">
        <p className="text-sm text-ink-muted">
          Enter the 6-digit code sent to your phone.
        </p>
        {devCode && (
          <div className="rounded-xl bg-sage/5 border border-sage/20 px-4 py-3 text-sm">
            <p className="font-medium text-sage">
              {mockMode ? "Demo / test OTP" : "Test phone OTP"}
            </p>
            <p className="text-ink-muted mt-1">
              No SMS sent for this number. Your code:{" "}
              <span className="font-mono font-semibold text-ink">{devCode}</span>
            </p>
          </div>
        )}
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className="text-center text-2xl tracking-widest font-mono"
        />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <Button type="submit" disabled={loading || code.length !== 6} className="w-full">
          {loading ? "Verifying..." : "Verify & sign in"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setCode("");
            setError(null);
            setAltchaPayload(null);
            setAltchaKey((k) => k + 1);
          }}
          className="w-full text-sm text-ink-muted hover:text-ink"
        >
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-4">
      <div className="rounded-xl bg-sage/5 border border-sage/20 px-4 py-3 flex gap-3">
        <Shield className="h-5 w-5 text-sage shrink-0 mt-0.5" />
        <p className="text-sm text-ink-muted">
          Privacy first — your phone number verifies you&apos;re human. We don&apos;t sell your data.
        </p>
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(503) 555-0101"
          type="tel"
          required
          autoFocus
          className="pl-10"
        />
      </div>
      <AltchaWidget
        key={altchaKey}
        onPayloadChange={setAltchaPayload}
        className="rounded-xl border border-stone/60 bg-cream px-3 py-2"
      />
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <Button
        type="submit"
        disabled={loading || !altchaPayload || phone.replace(/\D/g, "").length < 10}
        className="w-full"
      >
        {loading ? "Sending..." : "Send verification code"}
      </Button>
      <p className="text-xs text-ink-muted text-center">
        Crew test OTP: Maya +15551001001 · Sam +15551001002 · Harper +15551001003 · Avery +15551001004
      </p>
    </form>
  );
}
