import { DiscoverView } from "@/components/listings/discover-view";
import { AlertBanner } from "@/components/discover/alert-banner";
import { getListings } from "@/lib/listings";
import { getAlertMatches } from "@/lib/alerts";
import { getCurrentUser } from "@/lib/auth";
import { getAreaPreference } from "@/lib/location";
import type { ListingType, ListingNatureTag } from "@/generated/prisma/client";

interface DiscoverPageProps {
  searchParams: Promise<{ category?: string; type?: string; nature?: string; cost?: string }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const [user, area] = await Promise.all([getCurrentUser(), getAreaPreference()]);

  const [listings, alertMatches] = await Promise.all([
    getListings({
      lat: area.latitude,
      lng: area.longitude,
      radiusMiles: area.radiusMiles,
      interestSlug: params.category,
      type: params.type as ListingType | undefined,
      natureTag: params.nature as ListingNatureTag | undefined,
      isPaid: params.cost === "paid" ? true : params.cost === "free" ? false : undefined,
    }),
    user ? getAlertMatches(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Discover</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Happening within {area.radiusMiles} miles of {area.locationLabel}
        </p>
      </div>

      {user && <AlertBanner matches={alertMatches} />}

      <DiscoverView
        listings={listings}
        center={[area.latitude, area.longitude]}
      />
    </div>
  );
}