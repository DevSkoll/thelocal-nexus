import { Badge } from "@/components/ui/badge";
import { formatNatureTag, formatPriceRange, formatListingType } from "@/lib/format";
import type { ListingType, ListingNatureTag } from "@/generated/prisma/client";

interface ListingTagsProps {
  isPaid: boolean;
  priceMin: number | null;
  priceMax: number | null;
  natureTag: ListingNatureTag;
  listingType?: ListingType;
  showListingType?: boolean;
  interests?: { slug?: string; name: string; icon?: string | null }[];
  className?: string;
}

export function ListingTags({
  isPaid,
  priceMin,
  priceMax,
  natureTag,
  listingType,
  showListingType = false,
  interests,
  className,
}: ListingTagsProps) {
  const priceLabel = formatPriceRange(priceMin, priceMax);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1.5">
        {isPaid && priceLabel && (
          <Badge variant="paid">
            Paid event · {priceLabel}
          </Badge>
        )}
        <Badge variant="nature">{formatNatureTag(natureTag)}</Badge>
        {showListingType && listingType && (
          <Badge variant="type">{formatListingType(listingType)}</Badge>
        )}
        {interests?.map((interest) => (
          <Badge key={interest.slug ?? interest.name} variant="interest">
            {interest.icon ? `${interest.icon} ` : null}
            {interest.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}