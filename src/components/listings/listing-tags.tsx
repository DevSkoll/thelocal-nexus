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
  className?: string;
}

export function ListingTags({
  isPaid,
  priceMin,
  priceMax,
  natureTag,
  listingType,
  showListingType = false,
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
      </div>
    </div>
  );
}