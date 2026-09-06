"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VouchButton({
  toSlug,
  alreadyVouched,
  isLoggedIn,
  phoneVerified,
}: {
  toSlug: string;
  alreadyVouched: boolean;
  isLoggedIn: boolean;
  phoneVerified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadyVouched);
  const [message, setMessage] = useState("");

  async function vouch() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!phoneVerified) {
      setMessage("Phone verification required to vouch.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/vouch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not vouch");
      setDone(true);
      setMessage("Thanks — your vouch is on their trust ledger.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-sage/25 bg-sage/5 px-4 py-3 text-sm text-sage font-medium">
        You vouched for this neighbor
        {message && <p className="mt-1 text-xs font-normal text-ink-muted">{message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="rounded-2xl"
        disabled={loading}
        onClick={vouch}
      >
        <HandHeart className="h-4 w-4" />
        {loading ? "Vouching..." : "Vouch for them"}
      </Button>
      <p className="text-xs text-ink-muted leading-relaxed">
        One vouch per person. Builds community trust (+8) — not a vanity metric.
      </p>
      {message && <p className="text-sm text-terracotta font-medium">{message}</p>}
    </div>
  );
}
