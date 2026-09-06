import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSkillOfferBySlug } from "@/lib/skills";
import { formatPriceRange } from "@/lib/format";
import { getPublicTrustSummary } from "@/lib/reputation";
import { TrustBadge } from "@/components/profiles/trust-badge";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const offer = await getSkillOfferBySlug(slug);
  if (!offer) return { title: "Skill not found" };
  return { title: `${offer.title} · Skills`, description: offer.description.slice(0, 160) };
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  const offer = await getSkillOfferBySlug(slug);
  if (!offer || offer.status === "ARCHIVED") notFound();

  const trust = await getPublicTrustSummary(offer.user.id);
  const price = formatPriceRange(offer.priceMin, offer.priceMax);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/skills" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-terracotta">
        <ArrowLeft className="h-4 w-4" /> Back to skills
      </Link>

      <div className="mt-4 rounded-[2rem] border border-stone/40 bg-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap gap-2 mb-3">
          {price ? <Badge variant="paid" className="normal-case tracking-normal">{price}</Badge> : <Badge variant="nature">Free / negotiable</Badge>}
          {offer.status === "PAUSED" && <Badge variant="default">Paused</Badge>}
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink leading-tight">{offer.title}</h1>
        {offer.locationLabel && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" /> {offer.locationLabel}
          </p>
        )}
        <p className="mt-6 text-ink leading-relaxed whitespace-pre-wrap">{offer.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {offer.interests.map(({ interest }) => (
            <Badge key={interest.id} variant="interest">{interest.icon} {interest.name}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] border border-stone/40 bg-cream/80 p-6">
        <p className="text-sm text-ink-muted mb-2">Offered by</p>
        <Link href={`/u/${offer.user.slug}`} className="font-serif text-xl font-bold hover:text-terracotta">
          {offer.user.name}
        </Link>
        {offer.user.headline && <p className="text-sage mt-1">{offer.user.headline}</p>}
        <div className="mt-4"><TrustBadge trust={trust} compact /></div>
      </div>
    </div>
  );
}
