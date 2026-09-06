import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireModerator } from "@/lib/moderation";
import type { ReportStatus } from "@/generated/prisma/client";

const reportSchema = z.object({
  listingId: z.string(),
  reason: z.enum(["SPAM", "SAFETY", "MISLEADING", "INAPPROPRIATE", "OTHER"]),
  details: z.string().max(1000).optional(),
});

const STATUS_FILTER = z.enum(["OPEN", "REVIEWING", "ACTIONED", "DISMISSED", "ALL"]);

/** Moderator queue — never includes reporter phone. */
export async function GET(req: NextRequest) {
  const { error } = await requireModerator();
  if (error) return error;

  const statusParam = req.nextUrl.searchParams.get("status") ?? "OPEN";
  const parsed = STATUS_FILTER.safeParse(statusParam);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const where =
    parsed.data === "ALL" ? {} : { status: parsed.data as ReportStatus };

  const reports = await db.report.findMany({
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
      reporter: {
        select: { id: true, name: true, slug: true },
      },
      reviewer: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return NextResponse.json({
    reports: reports.map((r) => ({
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
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = await req.json();
    const data = reportSchema.parse(body);

    const listing = await db.listing.findUnique({ where: { id: data.listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const report = await db.report.create({
      data: {
        listingId: data.listingId,
        reporterId: user.id,
        reason: data.reason,
        details: data.details,
        status: "OPEN",
      },
    });

    return NextResponse.json({ ok: true, id: report.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
