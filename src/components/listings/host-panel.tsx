"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  rsvps: RsvpUser[];
  initialAnnouncements: Announcement[];
}

export function HostPanel({ listingId, rsvps, initialAnnouncements }: HostPanelProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [announcementBody, setAnnouncementBody] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const pending = rsvps.filter((r) => r.status === "GOING" && !r.approved);
  const going = rsvps.filter((r) => r.status === "GOING" && r.approved);
  const interested = rsvps.filter((r) => r.status === "INTERESTED");

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-sage/30 bg-sage/5 p-6">
        <h2 className="font-serif text-lg font-bold text-sage">Host dashboard</h2>
        <p className="text-sm text-ink-muted mt-1">Manage attendees and send updates to RSVPs.</p>
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