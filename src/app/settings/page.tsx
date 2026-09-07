import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "@/components/settings/settings-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileEditForm } from "@/components/profiles/profile-edit-form";
import { getCurrentUser } from "@/lib/auth";
import { formatVerificationBadges } from "@/lib/format";
import { maskPhone } from "@/lib/phone";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const badges = formatVerificationBadges(user);

  const [alerts, groups, profileLinks] = await Promise.all([
    db.alert.findMany({
      where: { userId: user.id },
      include: { interest: true },
    }),
    db.groupMember.findMany({
      where: { userId: user.id },
      include: { group: true },
    }),
    db.profileLink.findMany({
      where: { userId: user.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Your settings</h1>

      <section className="mt-8 rounded-2xl border border-stone/60 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/15 font-serif text-xl font-bold text-terracotta">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-lg">{user.name}</p>
            <p className="text-sm text-ink-muted">{maskPhone(user.phone)}</p>
            {user.email && (
              <p className="text-xs text-ink-muted">{user.email}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {badges.map((badge) => (
                <Badge key={badge} variant="verified">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {user.bio && <p className="mt-4 text-sm text-ink-muted">{user.bio}</p>}
        {user.slug && (
          <p className="mt-2 text-sm">
            <Link href={`/u/${user.slug}`} className="text-terracotta font-semibold hover:underline">
              View public profile →
            </Link>
          </p>
        )}
      </section>

      
      <section id="edit-profile" className="mt-6 rounded-[1.75rem] border border-stone/60 bg-white p-6 scroll-mt-24">
        <h2 className="font-serif text-lg font-semibold mb-1">Edit public profile</h2>
        <p className="text-sm text-ink-muted mb-5">
          Customize how neighbors see you. Phone number stays private — always.
        </p>
        <ProfileEditForm
          name={user.name}
          slug={user.slug}
          headline={user.headline}
          bio={user.bio}
          pronouns={user.pronouns}
          avatarUrl={user.avatarUrl}
          coverImageUrl={user.coverImageUrl}
          showRealName={user.showRealName}
          showLocation={user.showLocation}
          showSkills={user.showSkills}
          showHostedListings={user.showHostedListings}
          showReputation={user.showReputation}
          showJoinDate={user.showJoinDate}
          links={profileLinks.map((l) => ({ label: l.label, url: l.url }))}
        />
      </section>
      <section className="mt-6 rounded-2xl border border-stone/60 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-terracotta" />
          <h2 className="font-serif text-lg font-semibold">Your area &amp; interests</h2>
        </div>
        <SettingsForm
          zipCode={user.zipCode}
          locationLabel={user.locationLabel}
          radiusMiles={user.radiusMiles}
          interestSlugs={user.interests.map((i) => i.interest.slug)}
          alertSlugs={alerts.map((a) => a.interest.slug)}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-stone/60 bg-white p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-serif text-lg font-semibold">Your groups</h2>
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link href="/groups/new" className="text-terracotta hover:underline">
              Create a group
            </Link>
            <Link href="/groups" className="text-sage hover:underline">
              Browse →
            </Link>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {groups.length === 0 && (
            <p className="text-sm text-ink-muted">You haven&apos;t joined any groups yet.</p>
          )}
          {groups.map((m) => (
            <Link
              key={m.id}
              href={`/groups/${m.group.slug}`}
              className="block rounded-xl bg-cream-dark px-4 py-3 text-sm hover:bg-cream-dark/80 transition-colors"
            >
              {m.group.name}
              {m.role === "ADMIN" && (
                <span className="text-xs text-sage ml-2">· admin</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-stone/60 bg-white p-6">
        <h2 className="font-serif text-lg font-semibold">Skills</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Share what you can offer neighbors. Discovery stays equal — no paid boosts.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/skills/new">
            <Button className="rounded-2xl">Offer a skill</Button>
          </Link>
          <Link href="/skills">
            <Button variant="outline" className="rounded-2xl">Browse skills</Button>
          </Link>
        </div>
      </section>

      <div className="mt-8 flex justify-between items-center">
        <Link href="/post">
          <Button>Post a listing</Button>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}