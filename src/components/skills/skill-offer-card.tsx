import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPriceRange } from "@/lib/format";
import { formatDistance } from "@/lib/utils";

type SkillCardOffer = {
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

export function SkillOfferCard({ offer }: { offer: SkillCardOffer }) {
  const price = formatPriceRange(offer.priceMin, offer.priceMax);
  return (
    <Link
      href={`/skills/${offer.slug}`}
      className="group block rounded-3xl border border-stone/50 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-terracotta/30"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-bold text-ink group-hover:text-terracotta transition-colors leading-snug">
          {offer.title}
        </h3>
        {price ? (
          <Badge variant="paid" className="shrink-0 normal-case tracking-normal">{price}</Badge>
        ) : (
          <Badge variant="nature" className="shrink-0">Free / negotiable</Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">{offer.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {offer.interests.map(({ interest }) => (
          <Badge key={interest.id} variant="interest">
            {interest.icon} {interest.name}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {offer.locationLabel && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {offer.locationLabel}
            {offer.distance != null && ` · ${formatDistance(offer.distance)}`}
          </span>
        )}
        <span>
          by{" "}
          <span className="font-medium text-ink">{offer.user.name}</span>
          {" · "}rep {offer.user.reputationScore}
        </span>
      </div>
    </Link>
  );
}
