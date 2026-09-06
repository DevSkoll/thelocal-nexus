import Link from "next/link";
import { PostForm } from "@/components/listings/post-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getAreaPreference } from "@/lib/location";
import { db } from "@/lib/db";

export default async function PostPage() {
  const [user, area] = await Promise.all([getCurrentUser(), getAreaPreference()]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Post a listing</h1>
        <p className="mt-3 text-ink-muted">
          Sign in to share what&apos;s happening in your community. It&apos;s free, always.
        </p>
        <Link href="/login" className="inline-block mt-6">
          <Button size="lg">Sign in to post</Button>
        </Link>
      </div>
    );
  }

  const userGroups = await db.groupMember.findMany({
    where: { userId: user.id, role: "ADMIN" },
    include: { group: true },
  });

  const defaultLocation = user.latitude != null && user.longitude != null
    ? {
        lat: user.latitude,
        lng: user.longitude,
        label: user.locationLabel ?? area.locationLabel,
      }
    : {
        lat: area.latitude,
        lng: area.longitude,
        label: area.locationLabel,
      };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold">Post a listing</h1>
        <p className="mt-2 text-ink-muted">
          Under 3 minutes. Free, always. Equal visibility for everyone.
        </p>
      </div>
      <PostForm
        userId={user.id}
        userGroups={userGroups.map((m) => ({ id: m.group.id, name: m.group.name }))}
        defaultLocation={defaultLocation}
      />
    </div>
  );
}