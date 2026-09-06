import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicTrustSummary } from "@/lib/reputation";

export function TrustBadge({
  trust,
  compact = false,
  className,
}: {
  trust: PublicTrustSummary;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-semibold text-sage border border-sage/20",
          className
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Rep {trust.score}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-3xl border border-sage/20 bg-gradient-to-br from-sage/5 to-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white shadow-md">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-serif text-xl font-bold text-sage">{trust.score}</p>
          <p className="text-xs text-ink-muted">community trust score</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {trust.phoneVerified && <Badge variant="verified">Phone verified</Badge>}
        {trust.isVerifiedHost && <Badge variant="verified">Verified host</Badge>}
        <Badge variant="default">{trust.positiveFeedbackCount} positive</Badge>
        {trust.vouchCount > 0 && <Badge variant="default">{trust.vouchCount} vouches</Badge>}
      </div>
      <p className="mt-3 text-xs text-ink-muted leading-relaxed">
        Trust is earned from real meetups and feedback — never bought, never boosted.
      </p>
    </div>
  );
}

export function ProfileLink({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <Link href={`/u/${slug}`} className={cn("font-medium hover:text-terracotta transition-colors", className)}>
      {name}
    </Link>
  );
}
