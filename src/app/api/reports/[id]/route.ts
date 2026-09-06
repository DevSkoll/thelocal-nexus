import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireModerator } from "@/lib/moderation";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["OPEN", "REVIEWING", "ACTIONED", "DISMISSED"]),
  resolutionNote: z.string().max(2000).optional().nullable(),
  /** When ACTIONED, optionally cancel the listing (severe cases). */
  cancelListing: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { user, error } = await requireModerator();
  if (error || !user) return error!;

  const { id } = await context.params;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const existing = await db.report.findUnique({
      where: { id },
      include: { listing: { select: { id: true, status: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (data.cancelListing) {
      if (data.status !== "ACTIONED") {
        return NextResponse.json(
          { error: "cancelListing is only allowed when status is ACTIONED" },
          { status: 400 }
        );
      }
      if (existing.listing.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Completed listings cannot be cancelled" },
          { status: 400 }
        );
      }
    }

    const reviewedAt =
      data.status === "OPEN" ? null : data.status === existing.status && existing.reviewedAt
        ? existing.reviewedAt
        : new Date();

    const reviewerId = data.status === "OPEN" ? null : user.id;

    const report = await db.$transaction(async (tx) => {
      if (data.cancelListing && existing.listing.status !== "CANCELLED") {
        await tx.listing.update({
          where: { id: existing.listingId },
          data: { status: "CANCELLED" },
        });
      }

      return tx.report.update({
        where: { id },
        data: {
          status: data.status,
          resolutionNote:
            data.resolutionNote === undefined
              ? undefined
              : data.resolutionNote,
          reviewedAt,
          reviewerId,
        },
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
    });

    return NextResponse.json({
      ok: true,
      report: {
        id: report.id,
        reason: report.reason,
        details: report.details,
        status: report.status,
        resolutionNote: report.resolutionNote,
        reviewedAt: report.reviewedAt?.toISOString() ?? null,
        createdAt: report.createdAt.toISOString(),
        listing: report.listing,
        reporter: { name: report.reporter.name, slug: report.reporter.slug },
        reviewer: report.reviewer
          ? { name: report.reviewer.name, slug: report.reviewer.slug }
          : null,
        listingCancelled: Boolean(data.cancelListing),
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
