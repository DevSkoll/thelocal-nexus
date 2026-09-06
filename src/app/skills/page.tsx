import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SkillOfferCard } from "@/components/skills/skill-offer-card";
import { SkillsFilters } from "@/components/skills/skills-filters";
import { listSkillOffers } from "@/lib/skills";
import { getAreaPreference } from "@/lib/location";
import { LISTING_CATEGORIES } from "@/lib/constants";

interface SkillsPageProps {
  searchParams: Promise<{
    interest?: string;
    priceMin?: string;
    priceMax?: string;
    minReputation?: string;
    q?: string;
  }>;
}

export const metadata = {
  title: "Skills near you · TheLocal",
  description: "Find neighbors offering skills — equal discovery, no paid boosts.",
};

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const params = await searchParams;
  const area = await getAreaPreference();

  const offers = await listSkillOffers({
    lat: area.latitude,
    lng: area.longitude,
    radiusMiles: area.radiusMiles,
    interestSlug: params.interest,
    priceMin: params.priceMin != null ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax != null ? Number(params.priceMax) : undefined,
    minReputation: params.minReputation != null ? Number(params.minReputation) : undefined,
    search: params.q,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-sage to-sage-dark text-white p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Skills marketplace
        </div>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold">Neighbors with skills</h1>
        <p className="mt-2 text-white/80 max-w-xl leading-relaxed">
          Browse what people near {area.locationLabel} offer. Filter by you — we never bury newcomers behind reputation.
        </p>
      </div>

      <SkillsFilters
        categories={[...LISTING_CATEGORIES]}
        current={{
          interest: params.interest,
          priceMin: params.priceMin,
          priceMax: params.priceMax,
          minReputation: params.minReputation,
          q: params.q,
        }}
      />

      <p className="mt-4 text-sm text-ink-muted">
        {offers.length} offer{offers.length === 1 ? "" : "s"} within {area.radiusMiles} miles · sorted by distance
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {offers.map((offer) => (
          <SkillOfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      {offers.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-stone/60 bg-cream/60 p-10 text-center">
          <p className="font-serif text-xl font-bold text-ink">Nothing here yet</p>
          <p className="mt-2 text-sm text-ink-muted">Be the first to share a skill in this area.</p>
          <Link href="/settings" className="inline-block mt-4 text-terracotta font-semibold hover:underline">
            Complete your profile →
          </Link>
        </div>
      )}
    </div>
  );
}
