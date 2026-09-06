"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RsvpUser {
  id: string;
  status: string;
  approved: boolean;
  message: string | null;
  user: { id: string; name: string };
}

interface Announcement {
  id: string;
  body: string;
  createdAt: string;
  host: { name: string };
}

interface HostPanelProps {
  listingId: string;
  listingSlug: string;
  listingStatus?: "ACTIVE" | "COMPLETED" | "CANCELLED";
  rsvps: RsvpUser[];
  initialAnnouncements: Announcement[];
}

export function HostPanel({
  listingId,
  listingSlug,
  listingStatus = "ACTIVE",
  rsvps,
  initialAnnouncements,
}: HostPanelProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [announcementBody, setAnnouncementBody] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState(listingStatus);
  const [completeMessage, setCompleteMessage] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  const pending = rsvps.filter((r) => r.status === "GOING" && !r.approved);
  const going = rsvps.filter((r) => r.status === "GOING" && r.approved);
  const interested = rsvps.filter((r) => r.status === "INTERESTED");
  const isActive = status === "ACTIVE";

  async function handleApprove(rsvpId: string, approved: boolean) {
    setLoading(rsvpId);
    try {
      await fetch("/api/rsvp/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId, approved }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function postAnnouncement() {
    if (!announcementBody.trim()) return;
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, body: announcementBody }),
    });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements((prev) => [data, ...prev]);
      setAnnouncementBody("");
    }
  }

  async function markCompleted() {
    if (status === "COMPLETED") return;
    if (
      !window.confirm(
        "Mark this listing completed? You’ll earn EVENT_HOSTED trust, and approved attendees earn EVENT_COMPLETED."
      )
    ) {
      return;
    }
    setLoading("complete");
    setCompleteMessage("");
    try {
      const res = await fetch("/api/listings/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to complete");
      setStatus("COMPLETED");
      setCompleteMessage("Marked completed — reputation ledger updated.");
      router.refresh();
    } catch (e) {
      setCompleteMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function cancelListing() {
    setLoading("cancel");
    setCancelMessage("");
    try {
      const res = await fetch("/api/listings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      setStatus("CANCELLED");
      setCancelConfirmOpen(false);
      setCancelMessage("Listing cancelled. History is preserved — it won’t show in discovery.");
      router.refresh();
    } catch (e) {
      setCancelMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-sage/30 bg-sage/5 p-6">
        <h2 className="font-serif text-lg font-bold text-sage">Host dashboard</h2>
        <p className="text-sm text-ink-muted mt-1">Manage attendees and send updates to RSVPs.</p>
        {isActive && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/listings/${listingSlug}/edit`}>
              <Button size="sm" variant="outline" className="rounded-xl">
                <Pencil className="h-4 w-4" />
                Edit listing
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-terracotta hover:bg-terracotta/10"
              onClick={() => {
                setCancelConfirmOpen(true);
                setCancelMessage("");
              }}
            >
              <XCircle className="h-4 w-4" />
              Cancel listing
            </Button>
          </div>
        )}
      </div>

      {cancelConfirmOpen && isActive && (
        <div className="rounded-2xl border-2 border-terracotta/40 bg-terracotta/5 p-6 space-y-3">
          <h3 className="font-semibold text-terracotta">Cancel this listing?</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Neighbors will no longer see it in discovery. RSVPs, messages, and history stay on the
            listing page — nothing is deleted. This can&apos;t be undone from here.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="rounded-xl bg-terracotta hover:bg-terracotta-dark"
              disabled={loading === "cancel"}
              onClick={cancelListing}
            >
              {loading === "cancel" ? "Cancelling..." : "Yes, cancel listing"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={loading === "cancel"}
              onClick={() => setCancelConfirmOpen(false)}
            >
              Keep it active
            </Button>
          </div>
          {cancelMessage && !cancelMessage.includes("cancelled") && (
            <p className="text-sm font-medium text-terracotta">{cancelMessage}</p>
          )}
        </div>
      )}

      {cancelMessage && status === "CANCELLED" && (
        <p className="rounded-2xl bg-stone/20 px-4 py-3 text-sm font-medium text-ink-muted">
          {cancelMessage}
        </p>
      )}

      <div className="rounded-2xl border border-stone/60 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold">Listing status</h3>
            <p className="text-sm text-ink-muted mt-0.5">
              {status === "COMPLETED"
                ? "Completed — trust awards applied (idempotent)."
                : status === "CANCELLED"
                  ? "Cancelled — preserved for history, hidden from discovery."
                  : "When the meetup happened, mark it completed to credit trust."}
            </p>
          </div>
          {status === "COMPLETED" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 text-sage px-3 py-1.5 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </span>
          ) : status === "CANCELLED" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone/20 text-ink-muted px-3 py-1.5 text-sm font-semibold">
              <XCircle className="h-4 w-4" />
              Cancelled
            </span>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl"
              disabled={loading === "complete"}
              onClick={markCompleted}
            >
              {loading === "complete" ? "Saving..." : "Mark completed"}
            </Button>
          )}
        </div>
        {completeMessage && (
          <p className="mt-3 text-sm font-medium text-sage">{completeMessage}</p>
        )}
      </div>

      {pending.length > 0 && (
        <div className="rounded-2xl border border-terracotta/30 bg-white p-6">
          <h3 className="font-semibold text-terracotta">Pending approval ({pending.length})</h3>
          <div className="mt-4 space-y-3">
            {pending.map((rsvp) => (
              <div key={rsvp.id} className="rounded-xl bg-cream-dark p-4">
                <p className="font-medium">{rsvp.user.name}</p>
                {rsvp.message && (
                  <p className="text-sm text-ink-muted mt-1 italic">&ldquo;{rsvp.message}&rdquo;</p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    disabled={loading === rsvp.id}
                    onClick={() => handleApprove(rsvp.id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading === rsvp.id}
                    onClick={() => handleApprove(rsvp.id, false)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-stone/60 bg-white p-6">
        <h3 className="font-semibold">Going ({going.length})</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {going.map((r) => (
            <span key={r.id} className="rounded-full bg-sage/10 text-sage px-3 py-1 text-sm font-medium">
              {r.user.name}
            </span>
          ))}
          {going.length === 0 && <p className="text-sm text-ink-muted">No confirmed attendees yet.</p>}
        </div>
      </div>

      {interested.length > 0 && (
        <div className="rounded-2xl border border-stone/60 bg-white p-6">
          <h3 className="font-semibold">Interested ({interested.length})</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {interested.map((r) => (
              <span key={r.id} className="rounded-full bg-cream-dark px-3 py-1 text-sm text-ink-muted">
                {r.user.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-stone/60 bg-white p-6">
        <h3 className="font-semibold">Announcements to RSVPs</h3>
        <Textarea
          className="mt-3"
          value={announcementBody}
          onChange={(e) => setAnnouncementBody(e.target.value)}
          placeholder="Weather update, parking info, what to bring..."
        />
        <Button className="mt-2" size="sm" onClick={postAnnouncement}>
          Send announcement
        </Button>
        {announcements.length > 0 && (
          <div className="mt-4 space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl bg-cream-dark p-3 text-sm">
                <p>{a.body}</p>
                <p className="text-xs text-ink-muted mt-1">— {a.host.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
