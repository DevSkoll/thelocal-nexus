import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users, ShieldCheck, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/listing-card";
import { JoinButton } from "@/components/groups/join-button";
import { getGroupBySlug } from "@/lib/listings";
import { getCurrentUser } from "@/lib/auth";
import { formatFounded, formatGroupVerification } from "@/lib/format";

interface GroupPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GroupPageProps) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) return { title: "Group not found" };
  return {
    title: group.name,
    description: group.description.slice(0, 160),
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) notFound();

  const user = await getCurrentUser();
  const membership = user
    ? group.members.find((m) => m.userId === user.id)
    : undefined;
  const isMember = !!membership;
  const isAdmin = membership?.role === "ADMIN";

  const verification = formatGroupVerification(group.verification);
  const upcomingListings = group.listings.filter(
    (l) => l.type !== "GROUP_SEEKING"
  );

  return (
    <div>
      <div className="border-b border-stone/40 brand-hero bg-gradient-to-br from-sage/8 to-terracotta/5">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-start gap-2 mb-3">
            <Badge variant="type">
              {group.type === "ORGANIZATION" ? "Organization" : group.type === "BUSINESS" ? "Business" : "Community"}
            </Badge>
            {verification && (
              <Badge variant="verified">
                <ShieldCheck className="h-3 w-3" />
                {verification}
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold">{group.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            {group.locationLabel && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {group.locationLabel}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {group.members.length} members
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatFounded(group.foundedAt)}
            </span>
          </div>

          <p className="mt-6 text-ink leading-relaxed max-w-2xl">{group.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <JoinButton
              groupId={group.id}
              groupName={group.name}
              isMember={isMember}
              isLoggedIn={!!user}
            />
            {isAdmin && (
              <Link
                href={`/groups/${group.slug}/admin`}
                className="inline-flex items-center rounded-xl border-2 border-sage bg-white px-5 py-2.5 text-sm font-semibold text-sage shadow-sm transition-colors hover:bg-sage/5"
              >
                Admin tools
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="font-serif text-xl font-bold mb-4">Upcoming & recurring</h2>
        {upcomingListings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted text-sm">No upcoming listings yet.</p>
        )}

        <h2 className="font-serif text-xl font-bold mt-10 mb-4">Members</h2>
        <div className="flex flex-wrap gap-2">
          {group.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-full bg-white border border-stone/60 px-3 py-1.5 text-sm"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-terracotta/15 text-xs font-medium text-terracotta">
                {member.user.name.charAt(0)}
              </div>
              {member.user.name}
              {member.role === "ADMIN" && (
                <span className="text-xs text-ink-muted">· admin</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-sage/5 border border-sage/20 p-6 text-center">
          <p className="font-serif text-lg font-bold text-sage">This group&apos;s page is its website</p>
          <p className="mt-2 text-sm text-ink-muted">
            Share this link anywhere — no account needed to browse.
          </p>
        </div>
      </div>
    </div>
  );
}