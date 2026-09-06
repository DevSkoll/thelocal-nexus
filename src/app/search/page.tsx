import Link from "next/link";
import { SearchForm } from "@/components/search/search-form";
import { ListingCard } from "@/components/listings/listing-card";
import { getListings } from "@/lib/listings";
import { getAreaPreference } from "@/lib/location";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const area = await getAreaPreference();

  const listings = params.q
    ? await getListings({
        lat: area.latitude,
        lng: area.longitude,
        radiusMiles: area.radiusMiles,
        search: params.q,
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold mb-2">Search</h1>
      <p className="text-sm text-ink-muted mb-6">
        Within {area.radiusMiles} miles of {area.locationLabel}
      </p>
      <SearchForm defaultQuery={params.q} />

      {params.q && (
        <div className="mt-8">
          <p className="text-sm text-ink-muted mb-4">
            {listings.length} result{listings.length !== 1 ? "s" : ""} for &ldquo;{params.q}&rdquo;
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {listings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone p-12 text-center">
              <p className="text-ink-muted">No listings match your search.</p>
              <Link href="/post" className="text-terracotta hover:underline text-sm mt-2 inline-block">
                Post something new →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}