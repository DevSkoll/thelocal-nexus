import { DiscoverView } from "@/components/listings/discover-view";
import { AlertBanner } from "@/components/discover/alert-banner";
import { getListings } from "@/lib/listings";
import { listSkillOffers } from "@/lib/skills";
import { getAlertMatches } from "@/lib/alerts";
import { getCurrentUser } from "@/lib/auth";
import { getAreaPreference } from "@/lib/location";
import {
  INTENT_LISTING_TYPES,
  parseDiscoverIntent,
} from "@/lib/constants";
import type { ListingType, ListingNatureTag } from "@/generated/prisma/client";

interface DiscoverPageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    nature?: string;
    cost?: string;
    intent?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const intent = parseDiscoverIntent(params.intent);
  const [user, area] = await Promise.all([getCurrentUser(), getAreaPreference()]);

  const intentTypes = intent
    ? (INTENT_LISTING_TYPES[intent] as ListingType[])
    : undefined;

  const [listings, skillOffers, alertMatches] = await Promise.all([
    getListings({
      lat: area.latitude,
      lng: area.longitude,
      radiusMiles: area.radiusMiles,
      interestSlug: params.category,
      type: !intentTypes ? (params.type as ListingType | undefined) : undefined,
      types: intentTypes,
      natureTag: params.nature as ListingNatureTag | undefined,
      isPaid: params.cost === "paid" ? true : params.cost === "free" ? false : undefined,
    }),
    // Offer chip also surfaces SkillOffer (skills marketplace) in the same results.
    intent === "offer"
      ? listSkillOffers({
          lat: area.latitude,
          lng: area.longitude,
          radiusMiles: area.radiusMiles,
          interestSlug: params.category,
        })
      : Promise.resolve([]),
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
        skillOffers={skillOffers}
        intent={intent}
        center={[area.latitude, area.longitude]}
      />
    </div>
  );
}
