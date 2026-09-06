"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  { value: "SAFETY", label: "Safety concern" },
  { value: "SPAM", label: "Spam or scam" },
  { value: "MISLEADING", label: "Misleading information" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "OTHER", label: "Other" },
] as const;

export function ReportButton({ listingId, isLoggedIn }: { listingId: string; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("SAFETY");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) return null;

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason, details: details || undefined }),
      });
      if (res.ok) {
        setSubmitted(true);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-sage font-medium flex items-center gap-1.5">
        <Flag className="h-4 w-4" />
        Report submitted. Our team will review it.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-ink-muted hover:text-terracotta flex items-center gap-1.5 transition-colors"
      >
        <Flag className="h-4 w-4" />
        Report this listing
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-stone/60 bg-white p-4 space-y-3">
          <p className="text-sm font-medium">Why are you reporting?</p>
          <div className="space-y-1">
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              Submit report
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}