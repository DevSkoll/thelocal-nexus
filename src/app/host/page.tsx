import Link from "next/link";
import { redirect } from "next/navigation";
import { HostPanel } from "@/components/listings/host-panel";
import { getCurrentUser } from "@/lib/auth";
import { getHostedListings } from "@/lib/host";
import { db } from "@/lib/db";
import { formatListingType } from "@/lib/format";

export default async function HostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await getHostedListings(user.id);

  if (listings.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold">Host dashboard</h1>
        <p className="mt-3 text-ink-muted">
          You don&apos;t have any active listings yet. Post something for your community.
        </p>
        <Link href="/post" className="inline-block mt-6 text-terracotta font-medium hover:underline">
          Post a listing →
        </Link>
      </div>
    );
  }

  const listingIds = listings.map((l) => l.id);
  const announcements = await db.announcement.findMany({
    where: { listingId: { in: listingIds } },
    include: { host: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Host dashboard</h1>
      <p className="mt-2 text-ink-muted">
        Manage your listings, approve RSVPs, and send announcements.
      </p>

      <div className="mt-8 space-y-12">
        {listings.map((listing) => {
          const listingAnnouncements = announcements
            .filter((a) => a.listingId === listing.id)
            .map((a) => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
            }));

          return (
            <div key={listing.id}>
              <div className="mb-4">
                <Link
                  href={`/listings/${listing.slug}`}
                  className="font-serif text-xl font-bold hover:text-terracotta transition-colors"
                >
                  {listing.title}
                </Link>
                <p className="text-sm text-ink-muted mt-0.5">
                  {formatListingType(listing.type)} · {listing.rsvps.length} RSVP{listing.rsvps.length !== 1 ? "s" : ""}
                </p>
              </div>
              <HostPanel
                listingId={listing.id}
                listingSlug={listing.slug}
                listingStatus={listing.status}
                rsvps={listing.rsvps}
                initialAnnouncements={listingAnnouncements}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}