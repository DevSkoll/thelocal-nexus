"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Map, List } from "lucide-react";
import { ListingCard } from "./listing-card";
import { ListingMap } from "./listing-map";
import { DiscoverToolbar } from "./discover-toolbar";
import { SkillOfferCard } from "@/components/skills/skill-offer-card";
import { cn } from "@/lib/utils";
import { DISCOVER_INTENTS, type DiscoverIntent } from "@/lib/constants";
import type { Listing, User, Group, Interest, ListingInterest, Rsvp } from "@/generated/prisma/client";

type ListingWithRelations = Listing & {
  interests: (ListingInterest & { interest: Interest })[];
  posterUser: User | null;
  posterGroup: Group | null;
  rsvps: Rsvp[];
  distance?: number;
};

type SkillOfferForDiscover = {
  id: string;
  slug: string;
  title: string;
  description: string;
  locationLabel: string | null;
  priceMin: number | null;
  priceMax: number | null;
  distance?: number;
  interests: { interest: { id: string; slug: string; name: string; icon: string | null } }[];
  user: {
    slug: string;
    name: string;
    reputationScore: number;
    verificationTier: string;
  };
};

interface DiscoverViewProps {
  listings: ListingWithRelations[];
  skillOffers?: SkillOfferForDiscover[];
  intent?: DiscoverIntent;
  center: [number, number];
}

function matchesSearch(listing: ListingWithRelations, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  const haystack = [
    listing.title,
    listing.description,
    listing.locationLabel,
    listing.posterUser?.name,
    listing.posterGroup?.name,
    ...listing.interests.map(({ interest }) => `${interest.name} ${interest.slug}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

function matchesSkillSearch(offer: SkillOfferForDiscover, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  const haystack = [
    offer.title,
    offer.description,
    offer.locationLabel,
    offer.user?.name,
    ...offer.interests.map(({ interest }) => `${interest.name} ${interest.slug}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

export function DiscoverView({
  listings,
  skillOffers = [],
  intent,
  center,
}: DiscoverViewProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const router = useRouter();

  const filteredListings = useMemo(
    () => listings.filter((listing) => matchesSearch(listing, searchQuery)),
    [listings, searchQuery]
  );

  const filteredSkills = useMemo(
    () => skillOffers.filter((offer) => matchesSkillSearch(offer, searchQuery)),
    [skillOffers, searchQuery]
  );

  const totalLoaded = listings.length + skillOffers.length;
  const resultCount = filteredListings.length + filteredSkills.length;
  const intentMeta = intent
    ? DISCOVER_INTENTS.find((i) => i.value === intent)
    : undefined;

  return (
    <div>
      <div className="sticky top-16 z-40 -mx-4 px-4 py-3 mb-4 bg-cream-dark/95 backdrop-blur-sm border-b border-stone/30">
        <DiscoverToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filtersOpen={filtersOpen}
          onFiltersToggle={() => setFiltersOpen((open) => !open)}
          resultCount={resultCount}
          totalCount={totalLoaded}
          intent={intent}
        />
      </div>

      <div className="flex items-center justify-end mb-4">
        <div className="flex rounded-xl border border-stone/60 bg-white p-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              view === "list" ? "bg-terracotta text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            <List className="h-4 w-4" />
            Browse
          </button>
          <button
            onClick={() => setView("map")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              view === "map" ? "bg-terracotta text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {filteredSkills.map((offer) => (
            <SkillOfferCard key={`skill-${offer.id}`} offer={offer} />
          ))}
          {resultCount === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-stone p-12 text-center">
              {totalLoaded === 0 ? (
                intentMeta ? (
                  <>
                    <p className="font-serif text-lg text-ink">{intentMeta.emptyTitle}</p>
                    <p className="mt-2 text-sm text-ink-muted">{intentMeta.emptyBody}</p>
                    {intent === "offer" && (
                      <Link
                        href="/skills/new"
                        className="inline-block mt-4 text-sm font-semibold text-terracotta hover:underline"
                      >
                        Offer a skill →
                      </Link>
                    )}
                    {intent === "do" && (
                      <Link
                        href="/post"
                        className="inline-block mt-4 text-sm font-semibold text-terracotta hover:underline"
                      >
                        Post something to do →
                      </Link>
                    )}
                    {intent === "help" && (
                      <Link
                        href="/post"
                        className="inline-block mt-4 text-sm font-semibold text-terracotta hover:underline"
                      >
                        Ask for help →
                      </Link>
                    )}
                    {intent === "volunteer" && (
                      <div className="mt-4 space-y-2">
                        <Link
                          href="/post?type=VOLUNTEER"
                          className="inline-block text-sm font-semibold text-terracotta hover:underline"
                        >
                          Post a volunteer opportunity →
                        </Link>
                        <p className="text-xs text-ink-muted">
                          Unpaid community work only. Offering a skill or paid help?{" "}
                          <Link href="/skills/new" className="text-sage hover:underline">
                            Use Offer a skill
                          </Link>
                          .
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-serif text-lg text-ink">Nothing here yet</p>
                    <p className="mt-2 text-sm text-ink-muted">
                      Be the first to post something in your area.
                    </p>
                  </>
                )
              ) : (
                <>
                  <p className="font-serif text-lg text-ink">No matches</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {searchQuery
                      ? `Nothing matches "${searchQuery}". Try different words or clear your filters.`
                      : "Try adjusting your filters."}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-sm text-terracotta hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {intent === "offer" && filteredSkills.length > 0 && (
            <p className="text-xs text-ink-muted">
              Map shows workshops; {filteredSkills.length} skill offer
              {filteredSkills.length === 1 ? "" : "s"} appear in Browse.
            </p>
          )}
          <ListingMap
            listings={filteredListings}
            center={center}
            onSelect={(slug) => router.push(`/listings/${slug}`)}
          />
        </div>
      )}
    </div>
  );
}
