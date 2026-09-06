"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DefaultLocation = {
  lat: number | null;
  lng: number | null;
  label: string;
  radiusMiles: number;
};

export function SkillCreateForm({ defaultLocation }: { defaultLocation: DefaultLocation }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    locationLabel: defaultLocation.label,
    priceMin: "",
    priceMax: "",
    interestSlugs: [] as string[],
  });

  function toggleInterest(slug: string) {
    setForm((prev) => ({
      ...prev,
      interestSlugs: prev.interestSlugs.includes(slug)
        ? prev.interestSlugs.filter((s) => s !== slug)
        : [...prev.interestSlugs, slug],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const priceMin = form.priceMin.trim() === "" ? null : Number(form.priceMin);
      const priceMax = form.priceMax.trim() === "" ? null : Number(form.priceMax);
      if (priceMin != null && Number.isNaN(priceMin)) throw new Error("Minimum price must be a number");
      if (priceMax != null && Number.isNaN(priceMax)) throw new Error("Maximum price must be a number");
      if (priceMin != null && priceMax != null && priceMax < priceMin) {
        throw new Error("Maximum price must be at least the minimum");
      }

      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          latitude: defaultLocation.lat,
          longitude: defaultLocation.lng,
          locationLabel: form.locationLabel.trim() || defaultLocation.label,
          radiusMiles: defaultLocation.radiusMiles,
          priceMin,
          priceMax,
          interestSlugs: form.interestSlugs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create skill offer");
      router.push(`/skills/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    form.interestSlugs.length > 0 &&
    !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[2rem] border border-stone/40 bg-white p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex items-center gap-2 text-sage">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">What can you offer?</h2>
            <p className="text-sm text-ink-muted">Neighbors discover skills by distance — never paid boosts.</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-muted">Title</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Bike tune-ups · porch guitar lessons"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-muted">Description</label>
          <Textarea
            className="mt-1 rounded-2xl min-h-[120px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What do you offer, who is it for, and how should neighbors reach out?"
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

        <div className="rounded-3xl border border-stone/50 bg-cream/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Optional price range</p>
          <p className="text-xs text-ink-muted">Leave blank if free, trade, or “ask me.”</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-ink-muted">Min ($)</label>
              <Input
                type="number"
                min="0"
                step="1"
                className="mt-1 rounded-2xl"
                value={form.priceMin}
                onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                placeholder="20"
              />
            </div>
            <div>
              <label className="text-sm text-ink-muted">Max ($)</label>
              <Input
                type="number"
                min="0"
                step="1"
                className="mt-1 rounded-2xl"
                value={form.priceMax}
                onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-stone/40 bg-white p-6 sm:p-8 shadow-md">
        <h3 className="font-serif text-lg font-bold">Interest tags</h3>
        <p className="mt-1 text-sm text-ink-muted">Pick at least one so people can find you.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggleInterest(cat.slug)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                form.interestSlugs.includes(cat.slug)
                  ? "bg-terracotta text-white shadow-sm scale-[1.02]"
                  : "bg-cream-dark text-ink-muted hover:text-ink hover:bg-cream border border-stone/40"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-terracotta rounded-2xl bg-terracotta/5 border border-terracotta/20 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" className="rounded-2xl px-8" disabled={!canSubmit}>
          {loading ? "Publishing..." : "Publish skill offer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-2xl"
          onClick={() => router.push("/skills")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
