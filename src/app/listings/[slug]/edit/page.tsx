import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ListingEditForm } from "@/components/listings/listing-edit-form";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";
import { isListingHost } from "@/lib/host";
import { getListingBySlug } from "@/lib/listings";

interface EditListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Edit listing" };
  return { title: `Edit · ${listing.title}` };
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/listings/${slug}/edit`);

  if (!isPhoneVerified(user)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold">Verify your phone</h1>
        <p className="mt-3 text-ink-muted">
          Phone verification is required to edit listings.
        </p>
        <Link href="/login" className="inline-block mt-6 text-terracotta font-medium hover:underline">
          Verify phone →
        </Link>
      </div>
    );
  }

  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const host = await isListingHost(listing.id, user.id);
  if (!host) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold">Hosts only</h1>
        <p className="mt-3 text-ink-muted">Only the host can edit this listing.</p>
        <Link
          href={`/listings/${listing.slug}`}
          className="inline-block mt-6 text-terracotta font-medium hover:underline"
        >
          Back to listing →
        </Link>
      </div>
    );
  }

  if (listing.status !== "ACTIVE") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold">Can&apos;t edit</h1>
        <p className="mt-3 text-ink-muted">
          Only active listings can be edited. This one is{" "}
          <span className="font-medium text-ink">{listing.status.toLowerCase()}</span>.
        </p>
        <Link
          href={`/listings/${listing.slug}`}
          className="inline-block mt-6 text-terracotta font-medium hover:underline"
        >
          Back to listing →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ListingEditForm
        initial={{
          id: listing.id,
          slug: listing.slug,
          type: listing.type,
          title: listing.title,
          description: listing.description,
          locationLabel: listing.locationLabel,
          latitude: listing.latitude,
          longitude: listing.longitude,
          locationPrecision: listing.locationPrecision,
          startsAt: listing.startsAt?.toISOString() ?? null,
          endsAt: listing.endsAt?.toISOString() ?? null,
          recurrenceRule: listing.recurrenceRule,
          capacity: listing.capacity,
          rsvpRequired: listing.rsvpRequired,
          rsvpApprovalRequired: listing.rsvpApprovalRequired,
          homeHosted: listing.homeHosted,
          isPaid: listing.isPaid,
          priceMin: listing.priceMin,
          priceMax: listing.priceMax,
          natureTag: listing.natureTag,
          interestSlugs: listing.interests.map((i) => i.interest.slug),
        }}
      />
    </div>
  );
}
