import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Sparkles,
  ExternalLink,
  Globe,
  Link2,
} from "lucide-react";
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

function linkIcon(label: string) {
  const key = label.toLowerCase();
  if (key.includes("web") || key.includes("site")) return Globe;
  if (key.includes("link")) return Link2;
  return ExternalLink;
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
  const alreadyVouched = me && !isOwn ? await hasVouched(me.id, profile.id) : false;
  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="overflow-hidden rounded-[2rem] border border-stone/40 bg-white shadow-md">
        {/* Cover */}
        <div
          className="h-36 sm:h-48 bg-gradient-to-br from-sage via-sage-dark to-terracotta/80 bg-cover bg-center"
          style={
            profile.coverImageUrl
              ? { backgroundImage: `url(${profile.coverImageUrl})` }
              : undefined
          }
        />

        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-terracotta to-terracotta-dark shadow-lg">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-4xl font-bold text-white">
                  {initial}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">{profile.name}</h1>
                {profile.realNameHidden && (
                  <span className="text-sm text-ink-muted font-medium">@{profile.slug}</span>
                )}
                {!profile.realNameHidden && (
                  <span className="text-sm text-ink-muted">@{profile.slug}</span>
                )}
                {isOwn && (
                  <Link href="/settings#edit-profile">
                    <Button size="sm" variant="secondary" className="rounded-full">
                      Edit profile
                    </Button>
                  </Link>
                )}
              </div>
              {profile.pronouns && (
                <p className="mt-1 text-sm text-ink-muted">{profile.pronouns}</p>
              )}
              {profile.headline && (
                <p className="mt-2 text-lg text-sage font-medium leading-snug">{profile.headline}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink-muted">
                {profile.locationLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.locationLabel}
                  </span>
                )}
                {profile.memberSince && (
                  <span className="rounded-full bg-cream-dark px-3 py-1">
                    {formatMemberSince(profile.memberSince)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-6 text-ink leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          )}

          {profile.links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.links.map((link) => {
                const Icon = linkIcon(link.label);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone/50 bg-cream/60 px-3.5 py-1.5 text-sm font-semibold text-sage hover:border-terracotta/40 hover:bg-terracotta/5 hover:text-terracotta transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </a>
                );
              })}
            </div>
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

          {profile.trust && (
            <div className="mt-6">
              <TrustBadge trust={profile.trust} />
            </div>
          )}

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
              <Link href="/settings#edit-profile">
                <Button variant="outline" className="rounded-2xl">
                  Edit profile
                </Button>
              </Link>
              <Link href="/skills/new">
                <Button className="rounded-2xl">Offer a skill</Button>
              </Link>
              <Link href="/skills">
                <Button variant="outline" className="rounded-2xl">
                  Browse skills
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {profile.privacy.showSkills && (
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
                      reputationScore: profile.reputationScore ?? 0,
                      verificationTier: profile.verificationTier,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {profile.privacy.showHostedListings && (
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
      )}
    </div>
  );
}
