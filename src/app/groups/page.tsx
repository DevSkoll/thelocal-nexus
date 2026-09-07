import Link from "next/link";
import { MapPin, Users, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listGroups } from "@/lib/groups";
import { getAreaPreference } from "@/lib/location";
import { formatDistance } from "@/lib/utils";
import { formatGroupVerification } from "@/lib/format";

interface GroupsPageProps {
  searchParams: Promise<{ type?: string; q?: string }>;
}

export const metadata = {
  title: "Groups near you · TheLocal",
  description: "Find community clubs, organizations, and local businesses near you.",
};

function typeLabel(type: string) {
  if (type === "ORGANIZATION") return "Organization";
  if (type === "BUSINESS") return "Business";
  return "Community";
}

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const params = await searchParams;
  const area = await getAreaPreference();
  const typeFilter =
    params.type === "COMMUNITY" ||
    params.type === "ORGANIZATION" ||
    params.type === "BUSINESS"
      ? params.type
      : undefined;

  const groups = await listGroups({
    lat: area.latitude,
    lng: area.longitude,
    radiusMiles: area.radiusMiles,
    type: typeFilter,
    search: params.q,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-sage to-sage-dark text-white p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <Users className="h-4 w-4" />
          Community groups
        </div>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold">Groups near you</h1>
        <p className="mt-2 text-white/80 max-w-xl leading-relaxed">
          Clubs, orgs, and local businesses around {area.locationLabel}. Join one — or start your
          own page neighbors can share.
        </p>
        <Link
          href="/groups/new"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white text-sage font-semibold px-5 py-2.5 shadow-md hover:bg-cream transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create a group
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: undefined, label: "All" },
          { value: "COMMUNITY", label: "Community" },
          { value: "ORGANIZATION", label: "Organization" },
          { value: "BUSINESS", label: "Business" },
        ].map((t) => {
          const active = (typeFilter ?? undefined) === t.value;
          const href = t.value ? `/groups?type=${t.value}` : "/groups";
          return (
            <Link
              key={t.label}
              href={href}
              className={
                active
                  ? "rounded-full bg-terracotta text-white px-3.5 py-1.5 text-sm font-medium shadow-sm"
                  : "rounded-full bg-cream-dark text-ink-muted hover:text-ink border border-stone/40 px-3.5 py-1.5 text-sm font-medium"
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-ink-muted">
        {groups.length} group{groups.length === 1 ? "" : "s"} within {area.radiusMiles} miles
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const verification = formatGroupVerification(group.verification);
          return (
            <Link
              key={group.id}
              href={`/groups/${group.slug}`}
              className="rounded-[1.75rem] border border-stone/40 bg-white p-5 shadow-sm hover:shadow-md hover:border-sage/30 transition-all"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="type">{typeLabel(group.type)}</Badge>
                {verification && <Badge variant="verified">{verification}</Badge>}
              </div>
              <h2 className="font-serif text-xl font-bold text-ink">{group.name}</h2>
              <p className="mt-2 text-sm text-ink-muted line-clamp-2 leading-relaxed">
                {group.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                {group.locationLabel && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {group.locationLabel}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {group._count.members} members
                </span>
                {group.distance != null && (
                  <span>{formatDistance(group.distance)}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-stone/60 bg-cream/60 p-10 text-center">
          <p className="font-serif text-lg font-bold text-ink">No groups in this area yet</p>
          <p className="mt-2 text-sm text-ink-muted">Be the first to start one for your neighborhood.</p>
          <Link href="/groups/new" className="inline-block mt-5">
            <Button className="rounded-2xl">Create a group</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
