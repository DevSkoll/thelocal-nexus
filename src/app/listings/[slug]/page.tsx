import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users, ShieldCheck, Home, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListingTags } from "@/components/listings/listing-tags";
import { RsvpButton } from "@/components/listings/rsvp-button";
import { HostPanel } from "@/components/listings/host-panel";
import { ListingMessages } from "@/components/listings/listing-messages";
import { ReportButton } from "@/components/listings/report-button";
import { getListingBySlug } from "@/lib/listings";
import { getCurrentUser } from "@/lib/auth";
import { isListingHost } from "@/lib/host";
import {
  formatListingDate,
  formatVerification,
  formatFounded,
} from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import { TrustBadge } from "@/components/profiles/trust-badge";
import { getPublicTrustSummary } from "@/lib/reputation";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      type: "article",
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isHost = user ? await isListingHost(listing.id, user.id) : false;
  const posterName = listing.posterGroup?.name ?? listing.posterUser?.name ?? "Community member";
  const posterLink = listing.posterGroup
    ? `/groups/${listing.posterGroup.slug}`
    : listing.posterUser?.slug
      ? `/u/${listing.posterUser.slug}`
      : null;
  const verification = listing.posterUser
    ? formatVerification(listing.posterUser.verificationTier, {
        phoneVerifiedAt: listing.posterUser.phoneVerifiedAt,
        emailVerifiedAt: listing.posterUser.emailVerifiedAt,
      })
    : null;
  const goingRsvps = listing.rsvps.filter((r) => r.status === "GOING" && r.approved);
  const hostTrust = listing.posterUser
    ? await getPublicTrustSummary(listing.posterUser.id)
    : null;
  const userRsvp = user
    ? listing.rsvps.find((r) => r.userId === user.id) ?? null
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ListingTags
        isPaid={listing.isPaid}
        priceMin={listing.priceMin}
        priceMax={listing.priceMax}
        natureTag={listing.natureTag}
        listingType={listing.type}
        showListingType
        className="mb-4"
      />

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink leading-tight">
        {listing.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {listing.interests.map(({ interest }) => (
          <Link key={interest.id} href={`/discover?category=${interest.slug}`}>
            <Badge variant="interest">
              {interest.icon} {interest.name}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {listing.locationLabel}
        </span>
        <span>
          {formatListingDate(listing.startsAt, listing.endsAt, listing.recurrenceRule)}
        </span>
        {goingRsvps.length > 0 && (
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {goingRsvps.length} going
          </span>
        )}
        {listing.homeHosted && (
          <span className="flex items-center gap-1.5 text-terracotta">
            <Home className="h-4 w-4" />
            Home-hosted · 18+
          </span>
        )}
      </div>

      <div className="mt-8">
        <p className="text-ink leading-relaxed whitespace-pre-wrap">{listing.description}</p>
      </div>

      {listing.announcements.length > 0 && (
        <div className="mt-6 rounded-2xl border border-sage/30 bg-sage/5 p-4 space-y-2">
          <p className="text-sm font-semibold text-sage">Host updates</p>
          {listing.announcements.map((a) => (
            <div key={a.id} className="text-sm">
              <p>{a.body}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {a.host.name} · {formatDistanceToNow(a.createdAt, { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isHost && (
        <div className="mt-8 rounded-2xl border border-stone/60 bg-white p-6">
          <h2 className="font-serif text-lg font-semibold mb-4">Connect</h2>
          <RsvpButton
            listingId={listing.id}
            listingSlug={listing.slug}
            rsvpRequired={listing.rsvpRequired}
            rsvpApprovalRequired={listing.rsvpApprovalRequired}
            homeHosted={listing.homeHosted}
            capacity={listing.capacity}
            goingCount={goingRsvps.length}
            userRsvp={userRsvp}
            isLoggedIn={!!user}
          />
        </div>
      )}

      {isHost && (
        <div className="mt-8">
          <HostPanel
            listingId={listing.id}
            listingStatus={listing.status}
            rsvps={listing.rsvps}
            initialAnnouncements={listing.announcements.map((a) => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
            }))}
          />
        </div>
      )}

      {goingRsvps.length > 0 && !isHost && (
        <div className="mt-6 rounded-2xl border border-stone/60 bg-white p-6">
          <h2 className="font-serif text-lg font-semibold mb-3">
            Attendees ({goingRsvps.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {goingRsvps.map((rsvp) => (
              <span
                key={rsvp.id}
                className="rounded-full bg-cream-dark px-3 py-1 text-sm text-ink-muted"
              >
                {rsvp.user.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <ListingMessages
          listingId={listing.id}
          isLoggedIn={!!user}
          currentUserId={user?.id}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-stone/60 bg-cream-dark/50 p-6">
        <p className="text-sm text-ink-muted">Posted by</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/20 font-serif font-bold text-terracotta">
            {posterName.charAt(0)}
          </div>
          <div>
            {posterLink ? (
              <Link href={posterLink} className="font-medium hover:text-terracotta transition-colors">
                {posterName}
              </Link>
            ) : (
              <p className="font-medium">{posterName}</p>
            )}
            {verification && (
              <p className="flex items-center gap-1 text-xs text-sage mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {verification}
              </p>
            )}
            {hostTrust && (
              <div className="mt-2"><TrustBadge trust={hostTrust} compact /></div>
            )}
            {listing.posterGroup && (
              <p className="text-xs text-ink-muted mt-0.5">
                {formatFounded(listing.posterGroup.foundedAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Share2 className="h-4 w-4" />
          <span>Share this listing — works for anyone, no account needed</span>
        </div>
        <ReportButton listingId={listing.id} isLoggedIn={!!user} />
      </div>
    </div>
  );
}