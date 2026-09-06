"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RsvpButtonProps {
  listingId: string;
  listingSlug: string;
  rsvpRequired: boolean;
  rsvpApprovalRequired: boolean;
  homeHosted: boolean;
  capacity: number | null;
  goingCount: number;
  userRsvp: { status: string; approved: boolean } | null;
  isLoggedIn: boolean;
}

export function RsvpButton({
  listingId,
  listingSlug,
  rsvpRequired,
  rsvpApprovalRequired,
  homeHosted,
  capacity,
  goingCount,
  userRsvp,
  isLoggedIn,
}: RsvpButtonProps) {
  const [status, setStatus] = useState(userRsvp?.status ?? null);
  const [approved, setApproved] = useState(userRsvp?.approved ?? true);
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  if (!rsvpRequired) {
    return (
      <div className="rounded-xl bg-cream-dark p-4 text-sm text-ink-muted">
        No RSVP needed — just show up!
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <a href="/login" className="block">
        <Button className="w-full">Sign in to RSVP</Button>
      </a>
    );
  }

  async function handleRsvp(rsvpStatus: "GOING" | "INTERESTED") {
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          status: rsvpStatus,
          message: message || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setApproved(data.approved);
        setShowMessage(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "GOING" && approved) {
    return (
      <div className="rounded-xl bg-sage/10 border border-sage/30 p-4">
        <p className="font-medium text-sage-dark">You&apos;re going!</p>
        <p className="text-sm text-ink-muted mt-1">
          The host will see you on the attendee list.
        </p>
      </div>
    );
  }

  if (status === "GOING" && !approved) {
    return (
      <div className="rounded-xl bg-sage/5 border border-sage/20 p-4">
        <p className="font-medium text-sage">RSVP pending approval</p>
        <p className="text-sm text-ink-muted mt-1">
          The host will review your request. You&apos;ll be notified when approved.
        </p>
      </div>
    );
  }

  const isFull = capacity != null && goingCount >= capacity;

  return (
    <div className="space-y-3">
      {homeHosted && (
        <div className="rounded-xl bg-terracotta/5 border border-terracotta/20 p-3 text-sm text-ink">
          <p className="font-medium text-terracotta">Home-hosted event · 18+</p>
          <p className="mt-1 text-ink-muted">
            Exact address shared after RSVP approval. Consider meeting in a public place first.
          </p>
        </div>
      )}

      {rsvpApprovalRequired && showMessage && (
        <div className="space-y-2">
          <label className="text-sm text-ink-muted">
            Introduce yourself to the host (optional)
          </label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'm new to the area and..."
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={loading || isFull}
          onClick={() => {
            if (rsvpApprovalRequired && !showMessage) {
              setShowMessage(true);
              return;
            }
            handleRsvp("GOING");
          }}
        >
          {isFull ? "Full" : loading ? "..." : "I'm going"}
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => handleRsvp("INTERESTED")}
        >
          Interested
        </Button>
      </div>

      {capacity != null && (
        <p className="text-xs text-ink-muted text-center">
          {goingCount} of {capacity} spots filled
        </p>
      )}
    </div>
  );
}