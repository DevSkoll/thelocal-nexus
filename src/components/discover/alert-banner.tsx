import Link from "next/link";
import { Bell } from "lucide-react";

interface AlertMatch {
  listing: { slug: string; title: string };
  interest?: { icon: string | null; name: string } | null;
}

export function AlertBanner({ matches }: { matches: AlertMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4">
      <div className="flex items-center gap-2 text-terracotta font-semibold text-sm">
        <Bell className="h-4 w-4" />
        New listings matching your alerts
      </div>
      <ul className="mt-2 space-y-1">
        {matches.map(({ listing, interest }) => (
          <li key={listing.slug}>
            <Link
              href={`/listings/${listing.slug}`}
              className="text-sm text-ink hover:text-terracotta transition-colors"
            >
              {interest?.icon} {listing.title}
              {interest && <span className="text-ink-muted"> · {interest.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}