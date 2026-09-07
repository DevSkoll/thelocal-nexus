import Link from "next/link";
import { MapPin, Users, ShieldCheck } from "lucide-react";
import { ListingTags } from "./listing-tags";
import { formatListingDate, formatVerification } from "@/lib/format";
import { formatDistance } from "@/lib/utils";
import type { Listing, User, Group, Interest, ListingInterest, Rsvp } from "@/generated/prisma/client";

type ListingWithRelations = Listing & {
  interests: (ListingInterest & { interest: Interest })[];
  posterUser: User | null;
  posterGroup: Group | null;
  rsvps: Rsvp[];
  distance?: number;
};

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const posterName =
    listing.posterGroup?.name ?? listing.posterUser?.name ?? "Community member";
  const verification = listing.posterUser
    ? formatVerification(listing.posterUser.verificationTier, {
        phoneVerifiedAt: listing.posterUser.phoneVerifiedAt,
        emailVerifiedAt: listing.posterUser.emailVerifiedAt,
      })
    : null;
  const goingCount = listing.rsvps.length;

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block rounded-2xl border border-stone/60 bg-white p-5 shadow-sm transition-all hover:border-sage/40 hover:shadow-md ring-1 ring-transparent hover:ring-sage/10"
    >
      <div className="flex items-start justify-between gap-3">
        <ListingTags
          isPaid={listing.isPaid}
          priceMin={listing.priceMin}
          priceMax={listing.priceMax}
          natureTag={listing.natureTag}
          interests={listing.interests.map(({ interest }) => interest)}
        />
        {listing.distance != null && (
          <span className="text-xs text-ink-muted whitespace-nowrap shrink-0">
            {formatDistance(listing.distance)}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-serif text-lg font-semibold text-ink group-hover:text-terracotta transition-colors line-clamp-2">
        {listing.title}
      </h3>

      <p className="mt-2 text-sm text-ink-muted line-clamp-2">{listing.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {listing.locationLabel}
        </span>
        <span>
          {formatListingDate(listing.startsAt, listing.endsAt, listing.recurrenceRule)}
        </span>
        {goingCount > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {goingCount} going
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-stone/40 flex items-center gap-2 text-xs text-ink-muted">
        <span>Posted by {posterName}</span>
        {verification && (
          <span className="flex items-center gap-0.5 text-sage-dark">
            <ShieldCheck className="h-3.5 w-3.5" />
            {verification}
          </span>
        )}
      </div>
    </Link>
  );
}