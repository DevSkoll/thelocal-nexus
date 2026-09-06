import Link from "next/link";
import { MapPin, Users, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { getListings } from "@/lib/listings";
import { getAreaPreference } from "@/lib/location";
import { APP_NAME } from "@/lib/constants";

export default async function HomePage() {
  const area = await getAreaPreference();

  const listings = await getListings({
    lat: area.latitude,
    lng: area.longitude,
    radiusMiles: area.radiusMiles,
  });

  const featured = listings.slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-stone/60 brand-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-terracotta/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sage tracking-wide uppercase mb-3">
              {APP_NAME}.nexus
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
              Happening near {area.locationLabel}
            </h1>
            <p className="mt-4 text-lg text-ink-muted leading-relaxed">
              A modern bulletin board for your neighborhood. Post events, find groups,
              discover gatherings — then log off and go live your life.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/discover">
                <Button size="lg">Explore nearby</Button>
              </Link>
              <Link href="/post">
                <Button size="lg" variant="secondary">
                  Post a listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MapPin,
              title: "Local by default",
              desc: "Everything anchored to place. Browse by map or category — nothing gets washed away.",
              accent: "bg-sage/10 text-sage",
            },
            {
              icon: Calendar,
              title: "Listings, not feeds",
              desc: "A post from Tuesday is just as visible Friday. No algorithm deciding what you see.",
              accent: "bg-terracotta/10 text-terracotta",
            },
            {
              icon: Users,
              title: "Community is the product",
              desc: "Groups, hosts, and organizers — not influencers. Equal visibility for everyone.",
              accent: "bg-sage/10 text-sage",
            },
            {
              icon: Shield,
              title: "Built for trust",
              desc: "Verification, RSVP, and reputation through history — not star ratings or sketchy vibes.",
              accent: "bg-terracotta/10 text-terracotta",
            },
          ].map(({ icon: Icon, title, desc, accent }) => (
            <div key={title} className="rounded-2xl bg-white border border-stone/60 p-5 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-serif font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-sage">
            Near {area.locationLabel}
          </h2>
          <Link href="/discover" className="text-sm text-terracotta font-medium hover:underline">
            View all →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone p-12 text-center">
            <p className="font-serif text-lg text-ink">Nothing nearby yet</p>
            <p className="mt-2 text-sm text-ink-muted">
              Be the first to post something in {area.locationLabel}.
            </p>
            <Link href="/post" className="inline-block mt-4">
              <Button>Post a listing</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl bg-sage border border-sage-dark p-8 sm:p-12 text-center text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-3">
            Free to post · Equal visibility
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Got something to share with your neighbors?
          </h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">
            Whether you&apos;re organizing a bike club, hosting a gathering, or coordinating
            volunteers — post in under 3 minutes. Your community is waiting.
          </p>
          <Link href="/post" className="inline-block mt-6">
            <Button size="lg" className="shadow-md">Post your first listing</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}