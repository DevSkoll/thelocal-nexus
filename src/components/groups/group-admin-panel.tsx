"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Megaphone, Shield, UserMinus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminMember = {
  id: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  user: { id: string; name: string; slug: string };
};

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function GroupAdminPanel({
  groupSlug,
  groupName,
  groupId,
  initialMembers,
  currentUserId,
}: {
  groupSlug: string;
  groupName: string;
  groupId: string;
  initialMembers: AdminMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const adminCount = useMemo(
    () => members.filter((m) => m.role === "ADMIN").length,
    [members]
  );

  async function setRole(userId: string, role: "ADMIN" | "MEMBER") {
    setBusyUserId(userId);
    setError("");
    try {
      const res = await fetch(`/api/groups/${groupSlug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role: data.member.role } : m))
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyUserId(null);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member from the group?")) return;
    setBusyUserId(userId);
    setError("");
    try {
      const res = await fetch(`/api/groups/${groupSlug}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone/50 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sage">
              Admin tools
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">Members</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Promote neighbors, keep at least one admin, and post events as {groupName}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1.5 text-xs font-semibold text-sage">
              <Users className="h-3.5 w-3.5" />
              {members.length} members
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-semibold text-terracotta">
              <Crown className="h-3.5 w-3.5" />
              {adminCount} admin{adminCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <Link
          href={`/post?group=${groupId}`}
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-terracotta/25 bg-gradient-to-r from-terracotta/10 to-sage/5 px-4 py-3 transition-colors hover:border-terracotta/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta text-white shadow-sm">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Post as my group</p>
              <p className="text-xs text-ink-muted">
                Listings show {groupName} as the host
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-terracotta">Open →</span>
        </Link>
      </div>

      {error && (
        <p className="rounded-2xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-3xl border border-stone/50 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_auto_auto] gap-3 border-b border-stone/40 bg-cream-dark/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted sm:grid">
          <span>Neighbor</span>
          <span className="w-28 text-center">Role</span>
          <span className="w-40 text-right">Actions</span>
        </div>

        <ul className="divide-y divide-stone/30">
          {members.map((member) => {
            const isSelf = member.user.id === currentUserId;
            const isLastAdmin = member.role === "ADMIN" && adminCount <= 1;
            const busy = busyUserId === member.user.id;

            return (
              <li
                key={member.id}
                className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sage/15 to-terracotta/10 text-sm font-bold text-sage">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/u/${member.user.slug}`}
                        className="truncate font-semibold text-ink hover:text-sage"
                      >
                        {member.user.name}
                      </Link>
                      {isSelf && (
                        <Badge variant="type" className="text-[10px]">
                          you
                        </Badge>
                      )}
                      {member.role === "ADMIN" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-sage">
                          <Shield className="h-3 w-3" />
                          admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      Joined {formatJoined(member.joinedAt)}
                    </p>
                  </div>
                </div>

                <div className="sm:w-28 sm:text-center">
                  <select
                    className={cn(
                      "w-full rounded-xl border border-stone/70 bg-white px-3 py-2 text-sm",
                      member.role === "ADMIN" && "border-sage/40 text-sage font-medium"
                    )}
                    value={member.role}
                    disabled={busy || (isLastAdmin && member.role === "ADMIN")}
                    onChange={(e) =>
                      setRole(member.user.id, e.target.value as "ADMIN" | "MEMBER")
                    }
                    aria-label={`Role for ${member.user.name}`}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex sm:w-40 sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={busy || isLastAdmin}
                    onClick={() => removeMember(member.user.id)}
                    title={isLastAdmin ? "Cannot remove the last admin" : "Remove member"}
                  >
                    <UserMinus className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {members.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">No members yet.</p>
        )}
      </div>

      <p className="text-center text-xs text-ink-muted">
        Phone numbers stay private. Admins manage roles and group listings only.
      </p>
    </div>
  );
}
