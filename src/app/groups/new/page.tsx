import Link from "next/link";
import { GroupCreateForm } from "@/components/groups/group-create-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";
import { getAreaPreference } from "@/lib/location";

export const metadata = {
  title: "Create a group · TheLocal",
  description: "Start a community, organization, or business group page for neighbors near you.",
};

export default async function NewGroupPage() {
  const [user, area] = await Promise.all([getCurrentUser(), getAreaPreference()]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Create a group</h1>
        <p className="mt-3 text-ink-muted">
          Sign in with your phone to start a community page neighbors can share.
        </p>
        <Link href="/login" className="inline-block mt-6">
          <Button size="lg" className="rounded-2xl">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  if (!isPhoneVerified(user)) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Phone verification required</h1>
        <p className="mt-3 text-ink-muted">
          Creating a group needs a verified phone so neighbors know you&apos;re real.
        </p>
        <Link href="/login" className="inline-block mt-6">
          <Button size="lg" className="rounded-2xl">
            Verify phone
          </Button>
        </Link>
      </div>
    );
  }

  const defaultLocation = {
    lat: user.latitude ?? area.latitude,
    lng: user.longitude ?? area.longitude,
    label: user.locationLabel ?? area.locationLabel,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-sage to-sage-dark text-white p-6 sm:p-8 shadow-lg brand-hero">
        <p className="text-white/80 text-sm font-medium">Groups</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold">Start something local</h1>
        <p className="mt-2 text-white/85 max-w-lg leading-relaxed">
          Community clubs, organizations, and local businesses get a shareable page near{" "}
          {defaultLocation.label} — equal visibility, no follower counts.
        </p>
      </div>
      <GroupCreateForm defaultLocation={defaultLocation} />
    </div>
  );
}
