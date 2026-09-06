import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/profiles/trust-badge";
import { VouchButton } from "@/components/profiles/vouch-button";
import { SkillOfferCard } from "@/components/skills/skill-offer-card";
import { ListingTags } from "@/components/listings/listing-tags";
import { getPublicProfileBySlug } from "@/lib/profiles";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";
import { hasVouched } from "@/lib/reputation";
import { formatMemberSince } from "@/lib/format";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.name} · TheLocal`,
    description: profile.headline || profile.bio?.slice(0, 160) || `Community member on TheLocal`,
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const [profile, me] = await Promise.all([getPublicProfileBySlug(slug), getCurrentUser()]);
  if (!profile) notFound();
  const isOwn = me?.id === profile.id;
  const alreadyVouched =
    me && !isOwn ? await hasVouched(me.id, profile.id) : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="rounded-[2rem] border border-stone/40 bg-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-terracotta to-terracotta-dark font-serif text-3xl font-bold text-white shadow-lg">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">{profile.name}</h1>
              {isOwn && (
                <Link href="/settings">
                  <Button size="sm" variant="secondary">Edit profile</Button>
                </Link>
              )}
            </div>
            {profile.headline && (
              <p className="mt-2 text-lg text-sage font-medium leading-snug">{profile.headline}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-muted">
              {profile.locationLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.locationLabel}
                </span>
              )}
              <span className="rounded-full bg-cream-dark px-3 py-1">{formatMemberSince(profile.memberSince)}</span>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-6 text-ink leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        )}

        {profile.interests.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge key={interest.id} variant="interest">
                {interest.icon} {interest.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-6">
          <TrustBadge trust={profile.trust} />
        </div>

        {!isOwn && (
          <div className="mt-5">
            <VouchButton
              toSlug={profile.slug}
              alreadyVouched={alreadyVouched}
              isLoggedIn={!!me}
              phoneVerified={me ? isPhoneVerified(me) : false}
            />
          </div>
        )}

        {isOwn && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/skills/new">
              <Button className="rounded-2xl">Offer a skill</Button>
            </Link>
            <Link href="/skills">
              <Button variant="outline" className="rounded-2xl">Browse skills</Button>
            </Link>
          </div>
        )}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-terracotta" />
            <h2 className="font-serif text-2xl font-bold">Skills offered</h2>
          </div>
          {isOwn && (
            <Link href="/skills/new" className="text-sm font-semibold text-terracotta hover:underline">
              Add skill →
            </Link>
          )}
        </div>
        {profile.skillOffers.length === 0 ? (
          <p className="text-sm text-ink-muted rounded-3xl border border-dashed border-stone/60 bg-cream/50 p-6">
            No active skill offers yet.
            {isOwn && (
              <>
                {" "}
                <Link href="/skills/new" className="text-terracotta font-semibold hover:underline">
                  Create one
                </Link>
              </>
            )}
          </p>
        ) : (
          <div className="grid gap-4">
            {profile.skillOffers.map((offer) => (
              <SkillOfferCard
                key={offer.id}
                offer={{
                  ...offer,
                  user: {
                    slug: profile.slug,
                    name: profile.name,
                    reputationScore: profile.reputationScore,
                    verificationTier: profile.verificationTier,
                  },
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold mb-4">Hosted listings</h2>
        {profile.hostedListings.length === 0 ? (
          <p className="text-sm text-ink-muted rounded-3xl border border-dashed border-stone/60 bg-cream/50 p-6">
            No active listings right now.
          </p>
        ) : (
          <div className="space-y-3">
            {profile.hostedListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="block rounded-3xl border border-stone/50 bg-white p-5 shadow-sm hover:shadow-md hover:border-sage/30 transition-all"
              >
                <ListingTags
                  isPaid={listing.isPaid}
                  priceMin={listing.priceMin}
                  priceMax={listing.priceMax}
                  natureTag={listing.natureTag}
                  listingType={listing.type}
                  className="mb-2"
                />
                <h3 className="font-serif text-lg font-bold">{listing.title}</h3>
                <p className="mt-1 text-sm text-ink-muted line-clamp-2">{listing.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
