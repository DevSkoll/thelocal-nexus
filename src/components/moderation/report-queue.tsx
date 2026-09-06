"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type QueueReport = {
  id: string;
  reason: string;
  details: string | null;
  status: "OPEN" | "REVIEWING" | "ACTIONED" | "DISMISSED";
  resolutionNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  listing: {
    id: string;
    slug: string;
    title: string;
    status: string;
    locationLabel: string;
  };
  reporter: { name: string; slug: string };
  reviewer: { name: string; slug: string } | null;
};

const STATUS_TABS = [
  { value: "OPEN", label: "Open" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "ACTIONED", label: "Actioned" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ALL", label: "All" },
] as const;

const REASON_LABELS: Record<string, string> = {
  SAFETY: "Safety concern",
  SPAM: "Spam or scam",
  MISLEADING: "Misleading",
  INAPPROPRIATE: "Inappropriate",
  OTHER: "Other",
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-terracotta/10 text-terracotta border-terracotta/25";
    case "REVIEWING":
      return "bg-sage/10 text-sage border-sage/25";
    case "ACTIONED":
      return "bg-sage text-white border-sage";
    case "DISMISSED":
      return "bg-cream-dark text-ink-muted border-stone/50";
    default:
      return "";
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ReportQueue({
  initialReports,
  initialStatus,
  statusCounts,
}: {
  initialReports: QueueReport[];
  initialStatus: string;
  statusCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialStatus);
  const [reports, setReports] = useState(initialReports);
  const [counts, setCounts] = useState(statusCounts);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStatus(next: string) {
    setFilter(next);
    setMessage(null);
    const res = await fetch(`/api/reports?status=${encodeURIComponent(next)}`);
    if (!res.ok) {
      setMessage("Could not refresh queue");
      return;
    }
    const data = await res.json();
    setReports(data.reports);
    router.replace(`/moderation?status=${encodeURIComponent(next)}`, { scroll: false });
  }

  async function updateReport(
    id: string,
    status: QueueReport["status"],
    opts?: { cancelListing?: boolean }
  ) {
    setLoadingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolutionNote: notes[id]?.trim() || undefined,
          cancelListing: opts?.cancelListing ?? false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");

      setReports((prev) => {
        const before = prev.find((r) => r.id === id);
        const updated = prev.map((r) => (r.id === id ? { ...r, ...data.report } : r));
        if (before && before.status !== data.report.status) {
          setCounts((c) => {
            const next = { ...c };
            next[before.status] = Math.max(0, (next[before.status] ?? 1) - 1);
            next[data.report.status] = (next[data.report.status] ?? 0) + 1;
            return next;
          });
        }
        if (filter !== "ALL" && data.report.status !== filter) {
          return updated.filter((r) => r.id !== id);
        }
        return updated;
      });

      if (data.report.listingCancelled) {
        setMessage("Report actioned and listing cancelled.");
      } else {
        setMessage(`Marked ${status.toLowerCase()}.`);
      }
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const active = filter === tab.value;
          const count = counts[tab.value];
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => loadStatus(tab.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors border ${
                active
                  ? "bg-sage text-white border-sage shadow-sm"
                  : "bg-white text-ink-muted border-stone/60 hover:border-sage/40 hover:text-sage"
              }`}
            >
              {tab.label}
              {typeof count === "number" ? (
                <span className={`ml-1.5 ${active ? "text-white/80" : "text-ink-muted"}`}>
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {message && (
        <p className="rounded-2xl border border-sage/20 bg-sage/5 px-4 py-3 text-sm text-sage">
          {message}
        </p>
      )}

      {reports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone/70 bg-white/80 px-6 py-16 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-sage/40" />
          <p className="mt-4 font-serif text-xl font-bold text-ink">Queue looks clear</p>
          <p className="mt-2 text-sm text-ink-muted">
            No reports in this filter. Neighbors can flag listings from the listing page.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-3xl border border-stone/50 bg-white p-5 shadow-sm ring-1 ring-sage/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusBadgeClass(report.status)}>{report.status}</Badge>
                    <Badge variant="type">{REASON_LABELS[report.reason] ?? report.reason}</Badge>
                    {report.listing.status === "CANCELLED" && (
                      <Badge variant="default">Listing cancelled</Badge>
                    )}
                  </div>
                  <Link
                    href={`/listings/${report.listing.slug}`}
                    className="inline-flex items-center gap-1.5 font-serif text-lg font-bold text-ink hover:text-terracotta transition-colors"
                  >
                    {report.listing.title}
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  </Link>
                  <p className="text-sm text-ink-muted">{report.listing.locationLabel}</p>
                </div>
                <div className="text-right text-xs text-ink-muted">
                  <p className="flex items-center justify-end gap-1">
                    <Flag className="h-3.5 w-3.5" />
                    {formatWhen(report.createdAt)}
                  </p>
                  <p className="mt-1">
                    Reporter{" "}
                    <Link href={`/u/${report.reporter.slug}`} className="font-medium text-sage hover:underline">
                      {report.reporter.name}
                    </Link>
                  </p>
                  {report.reviewer && (
                    <p className="mt-0.5">
                      Reviewed by {report.reviewer.name}
                      {report.reviewedAt ? ` · ${formatWhen(report.reviewedAt)}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {report.details && (
                <p className="mt-3 rounded-2xl bg-cream-dark/80 px-4 py-3 text-sm text-ink leading-relaxed">
                  {report.details}
                </p>
              )}

              {report.resolutionNote && (
                <p className="mt-2 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">Note:</span> {report.resolutionNote}
                </p>
              )}

              <div className="mt-4 space-y-3">
                <Textarea
                  value={notes[report.id] ?? report.resolutionNote ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                  }
                  placeholder="Resolution note (optional)"
                  className="min-h-[72px] rounded-2xl"
                />
                <div className="flex flex-wrap gap-2">
                  {report.status !== "REVIEWING" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={loadingId === report.id}
                      onClick={() => updateReport(report.id, "REVIEWING")}
                    >
                      Mark reviewing
                    </Button>
                  )}
                  {report.status !== "DISMISSED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingId === report.id}
                      onClick={() => updateReport(report.id, "DISMISSED")}
                    >
                      Dismiss
                    </Button>
                  )}
                  {report.status !== "ACTIONED" && (
                    <Button
                      size="sm"
                      disabled={loadingId === report.id}
                      onClick={() => updateReport(report.id, "ACTIONED")}
                    >
                      Actioned
                    </Button>
                  )}
                  {report.listing.status !== "CANCELLED" &&
                    report.listing.status !== "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-terracotta"
                        disabled={loadingId === report.id}
                        onClick={() => {
                          if (
                            !window.confirm(
                              "Action this report and cancel the listing? Guests will no longer see it as active."
                            )
                          ) {
                            return;
                          }
                          updateReport(report.id, "ACTIONED", { cancelListing: true });
                        }}
                      >
                        Action + cancel listing
                      </Button>
                    )}
                  {report.status !== "OPEN" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loadingId === report.id}
                      onClick={() => updateReport(report.id, "OPEN")}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
