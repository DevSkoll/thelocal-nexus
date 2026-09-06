"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, MapPin, Building2, Store, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type GroupTypeValue = "COMMUNITY" | "ORGANIZATION" | "BUSINESS";

type DefaultLocation = {
  lat: number | null;
  lng: number | null;
  label: string;
};

const GROUP_TYPES: {
  value: GroupTypeValue;
  label: string;
  blurb: string;
  icon: typeof Users;
}[] = [
  {
    value: "COMMUNITY",
    label: "Community",
    blurb: "Clubs, hangouts, and neighbor circles",
    icon: HeartHandshake,
  },
  {
    value: "ORGANIZATION",
    label: "Organization",
    blurb: "Nonprofits, mutual aid, civic groups",
    icon: Building2,
  },
  {
    value: "BUSINESS",
    label: "Business",
    blurb: "Local shops and venues with a community page",
    icon: Store,
  },
];

export function GroupCreateForm({ defaultLocation }: { defaultLocation: DefaultLocation }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "COMMUNITY" as GroupTypeValue,
    locationLabel: defaultLocation.label,
    coverImageUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          type: form.type,
          latitude: defaultLocation.lat,
          longitude: defaultLocation.lng,
          locationLabel: form.locationLabel.trim() || defaultLocation.label,
          coverImageUrl: form.coverImageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create group");
      router.push(`/groups/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    form.name.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[2rem] border border-stone/40 bg-white p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex items-center gap-2 text-sage">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage text-white shadow-md">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">Start a group</h2>
            <p className="text-sm text-ink-muted">
              Your page is the website — share the link anywhere.
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-muted">Group name</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Hawthorne Saturday Cyclists"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-muted">About</label>
          <Textarea
            className="mt-1 rounded-2xl min-h-[120px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Who is this for, when you gather, and how neighbors can join in?"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-muted flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Area label
          </label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.locationLabel}
            onChange={(e) => setForm({ ...form, locationLabel: e.target.value })}
            placeholder="Hawthorne, Portland"
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Prefills from your profile / area · exact address stays private.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-muted">Cover image URL (optional)</label>
          <Input
            className="mt-1 rounded-2xl"
            type="url"
            value={form.coverImageUrl}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
            placeholder="https://…"
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Paste a public image link for now — uploads come later.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-stone/40 bg-white p-6 sm:p-8 shadow-md">
        <h3 className="font-serif text-lg font-bold">What kind of group?</h3>
        <p className="mt-1 text-sm text-ink-muted">Pick the label that fits neighbors best.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {GROUP_TYPES.map((t) => {
            const Icon = t.icon;
            const selected = form.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className={cn(
                  "rounded-3xl border p-4 text-left transition-all",
                  selected
                    ? "border-terracotta bg-terracotta/5 shadow-md ring-2 ring-terracotta/30 scale-[1.01]"
                    : "border-stone/50 bg-cream/50 hover:border-sage/40 hover:bg-cream"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl mb-2",
                    selected ? "bg-terracotta text-white" : "bg-sage/10 text-sage"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-semibold text-ink">{t.label}</p>
                <p className="mt-1 text-xs text-ink-muted leading-snug">{t.blurb}</p>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-terracotta rounded-2xl bg-terracotta/5 border border-terracotta/20 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" className="rounded-2xl px-8" disabled={!canSubmit}>
          {loading ? "Creating..." : "Create group"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl"
          onClick={() => router.push("/groups")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
