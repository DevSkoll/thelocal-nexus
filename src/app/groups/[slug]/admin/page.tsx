import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GroupAdminPanel } from "@/components/groups/group-admin-panel";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";
import { getGroupBySlugForAdmin, isGroupAdmin, listGroupMembers } from "@/lib/groups/admin";

interface AdminPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AdminPageProps) {
  const { slug } = await params;
  const group = await getGroupBySlugForAdmin(slug);
  if (!group) return { title: "Group not found" };
  return {
    title: `Admin · ${group.name}`,
    description: `Manage members and post as ${group.name}`,
  };
}

export default async function GroupAdminPage({ params }: AdminPageProps) {
  const { slug } = await params;
  const group = await getGroupBySlugForAdmin(slug);
  if (!group) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/groups/${slug}/admin`);
  }

  if (!isPhoneVerified(user)) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Phone verification required</h1>
        <p className="mt-3 text-ink-muted">
          Group admin tools need a verified phone so neighbors know you&apos;re real.
        </p>
        <Link href="/login" className="inline-block mt-6">
          <Button size="lg" className="rounded-2xl">
            Verify phone
          </Button>
        </Link>
      </div>
    );
  }

  const admin = await isGroupAdmin(user.id, group.id);
  if (!admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Admins only</h1>
        <p className="mt-3 text-ink-muted">
          Only group admins can manage members for {group.name}.
        </p>
        <Link href={`/groups/${slug}`} className="inline-block mt-6">
          <Button variant="outline" className="rounded-2xl">
            Back to group
          </Button>
        </Link>
      </div>
    );
  }

  const members = await listGroupMembers(group.id);

  return (
    <div>
      <div className="border-b border-stone/40 brand-hero bg-gradient-to-br from-sage/10 to-terracotta/5">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link
            href={`/groups/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-terracotta"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {group.name}
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold text-ink">Group admin</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Member roles, removals, and posting as {group.name} — bubbly tools for real-world
            community hosts.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <GroupAdminPanel
          groupSlug={group.slug}
          groupName={group.name}
          groupId={group.id}
          currentUserId={user.id}
          initialMembers={members.map((m) => ({
            id: m.id,
            role: m.role,
            joinedAt: m.joinedAt.toISOString(),
            user: m.user,
          }))}
        />
      </div>
    </div>
  );
}
