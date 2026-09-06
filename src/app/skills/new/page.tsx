import Link from "next/link";
import { SkillCreateForm } from "@/components/skills/skill-create-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";
import { getAreaPreference } from "@/lib/location";

export const metadata = {
  title: "Offer a skill · TheLocal",
  description: "Share a skill with neighbors — equal discovery, no paid boosts.",
};

export default async function NewSkillPage() {
  const [user, area] = await Promise.all([getCurrentUser(), getAreaPreference()]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-semibold">Offer a skill</h1>
        <p className="mt-3 text-ink-muted">
          Sign in with your phone to share what you can offer neighbors.
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
          Skill offers need a verified phone so neighbors know you&apos;re real.
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
    radiusMiles: user.radiusMiles ?? area.radiusMiles,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-terracotta to-terracotta-dark text-white p-6 sm:p-8 shadow-lg">
        <p className="text-white/80 text-sm font-medium">Skills marketplace</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold">Offer a skill</h1>
        <p className="mt-2 text-white/85 max-w-lg leading-relaxed">
          Bubbly card, equal discovery. Your offer appears near {defaultLocation.label} — sorted by
          distance, never by who paid.
        </p>
      </div>
      <SkillCreateForm defaultLocation={defaultLocation} />
    </div>
  );
}
