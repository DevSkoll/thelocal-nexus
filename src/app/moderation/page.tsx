import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { isModerator } from "@/lib/moderation";
import { db } from "@/lib/db";
import { ReportQueue, type QueueReport } from "@/components/moderation/report-queue";
import type { ReportStatus } from "@/generated/prisma/client";

const ALLOWED = new Set(["OPEN", "REVIEWING", "ACTIONED", "DISMISSED", "ALL"]);

type SearchParams = Promise<{ status?: string }>;

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isModerator(user)) redirect("/");

  const params = await searchParams;
  const statusFilter = ALLOWED.has(params.status ?? "")
    ? (params.status as string)
    : "OPEN";

  const where =
    statusFilter === "ALL" ? {} : { status: statusFilter as ReportStatus };

  const rows = await db.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          locationLabel: true,
        },
      },
      reporter: { select: { name: true, slug: true } },
      reviewer: { select: { name: true, slug: true } },
    },
  });

  const reports: QueueReport[] = rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    status: r.status,
    resolutionNote: r.resolutionNote,
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    listing: r.listing,
    reporter: { name: r.reporter.name, slug: r.reporter.slug },
    reviewer: r.reviewer
      ? { name: r.reviewer.name, slug: r.reviewer.slug }
      : null,
  }));

  const [openCount, reviewingCount, actionedCount, dismissedCount] = await Promise.all([
    db.report.count({ where: { status: "OPEN" } }),
    db.report.count({ where: { status: "REVIEWING" } }),
    db.report.count({ where: { status: "ACTIONED" } }),
    db.report.count({ where: { status: "DISMISSED" } }),
  ]);
  const statusCounts = {
    OPEN: openCount,
    REVIEWING: reviewingCount,
    ACTIONED: actionedCount,
    DISMISSED: dismissedCount,
    ALL: openCount + reviewingCount + actionedCount + dismissedCount,
  };

  return (
    <div className="brand-hero min-h-[70vh]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sage">
              <Shield className="h-3.5 w-3.5" />
              Community care
            </p>
            <h1 className="mt-3 font-serif text-3xl font-bold text-ink">Moderation queue</h1>
            <p className="mt-2 max-w-xl text-ink-muted">
              Review neighbor reports, keep gatherings welcoming, and take action when needed.
              Phones stay private — you only see display names.
            </p>
          </div>
          <div className="rounded-2xl border border-stone/50 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-terracotta">{openCount}</p>
            <p className="text-xs font-medium text-ink-muted">open reports</p>
          </div>
        </div>

        <ReportQueue initialReports={reports} initialStatus={statusFilter} statusCounts={statusCounts} />

        <p className="mt-10 text-center text-sm text-ink-muted">
          Need the safety playbook?{" "}
          <Link href="/safety" className="font-medium text-sage hover:underline">
            Read community safety
          </Link>
        </p>
      </div>
    </div>
  );
}
