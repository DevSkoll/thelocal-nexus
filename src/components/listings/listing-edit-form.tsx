"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LISTING_TYPES, LISTING_CATEGORIES, LISTING_NATURE_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ListingEditInitial = {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  locationPrecision: string;
  startsAt: string | null;
  endsAt: string | null;
  recurrenceRule: string | null;
  capacity: number | null;
  rsvpRequired: boolean;
  rsvpApprovalRequired: boolean;
  homeHosted: boolean;
  isPaid: boolean;
  priceMin: number | null;
  priceMax: number | null;
  natureTag: string;
  interestSlugs: string[];
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ListingEditForm({ initial }: { initial: ListingEditInitial }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: initial.type,
    title: initial.title,
    description: initial.description,
    locationLabel: initial.locationLabel,
    latitude: initial.latitude,
    longitude: initial.longitude,
    locationPrecision: initial.locationPrecision,
    startsAt: toDatetimeLocal(initial.startsAt),
    endsAt: toDatetimeLocal(initial.endsAt),
    recurrenceRule: initial.recurrenceRule ?? "",
    capacity: initial.capacity != null ? String(initial.capacity) : "",
    rsvpRequired: initial.rsvpRequired,
    rsvpApprovalRequired: initial.rsvpApprovalRequired,
    homeHosted: initial.homeHosted,
    isPaid: initial.isPaid,
    priceMin: initial.priceMin != null ? String(initial.priceMin) : "",
    priceMax: initial.priceMax != null ? String(initial.priceMax) : "",
    natureTag: initial.natureTag,
    interestSlugs: initial.interestSlugs,
  });

  function update(field: string, value: string | boolean | string[] | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

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
      const res = await fetch(`/api/listings/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          recurrenceRule: form.recurrenceRule || null,
          capacity: form.capacity || null,
          priceMin: form.isPaid ? form.priceMin : null,
          priceMax: form.isPaid ? form.priceMax : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update listing");
      router.push(`/listings/${data.slug ?? initial.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSave =
    form.title.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    form.locationLabel.trim().length >= 2 &&
    form.interestSlugs.length > 0 &&
    (!form.isPaid || form.priceMin !== "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border-2 border-sage/20 bg-gradient-to-br from-white via-cream to-sage/5 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">Edit your listing</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Keep neighbors in the loop — update details anytime while it&apos;s active.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-stone/60 bg-white p-6 space-y-4 shadow-sm">
        <h2 className="font-serif text-lg font-semibold">Basics</h2>
        <div>
          <label className="text-sm font-medium text-ink-muted">Listing type</label>
          <select
            className="mt-1 w-full rounded-2xl border border-stone bg-cream-dark/40 px-4 py-2.5"
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
          >
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted">Title</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted">Description</label>
          <Textarea
            className="mt-1 rounded-2xl min-h-[140px]"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink-muted">Starts</label>
            <Input
              type="datetime-local"
              className="mt-1 rounded-2xl"
              value={form.startsAt}
              onChange={(e) => update("startsAt", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-muted">Ends</label>
            <Input
              type="datetime-local"
              className="mt-1 rounded-2xl"
              value={form.endsAt}
              onChange={(e) => update("endsAt", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted">Recurrence (optional)</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.recurrenceRule}
            onChange={(e) => update("recurrenceRule", e.target.value)}
            placeholder="weekly:saturday:09:00"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-stone/60 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sage" />
          <h2 className="font-serif text-lg font-semibold">Location</h2>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted">Location label</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.locationLabel}
            onChange={(e) => update("locationLabel", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink-muted">Latitude</label>
            <Input
              type="number"
              step="any"
              className="mt-1 rounded-2xl"
              value={form.latitude}
              onChange={(e) => update("latitude", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-muted">Longitude</label>
            <Input
              type="number"
              step="any"
              className="mt-1 rounded-2xl"
              value={form.longitude}
              onChange={(e) => update("longitude", Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted">Precision</label>
          <select
            className="mt-1 w-full rounded-2xl border border-stone bg-cream-dark/40 px-4 py-2.5"
            value={form.locationPrecision}
            onChange={(e) => update("locationPrecision", e.target.value)}
          >
            <option value="EXACT">Exact address</option>
            <option value="APPROXIMATE">Approximate area</option>
            <option value="NEIGHBORHOOD">Neighborhood only</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.homeHosted}
            onChange={(e) => update("homeHosted", e.target.checked)}
            className="rounded"
          />
          Hosted at a private residence (18+)
        </label>
      </section>

      <section className="rounded-3xl border border-stone/60 bg-white p-6 space-y-4 shadow-sm">
        <h2 className="font-serif text-lg font-semibold">Settings &amp; tags</h2>
        <div className="grid gap-2">
          {LISTING_NATURE_TAGS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => update("natureTag", tag.value)}
              className={cn(
                "text-left rounded-2xl border p-3 transition-colors",
                form.natureTag === tag.value
                  ? "border-sage bg-sage/5"
                  : "border-stone/60 hover:border-sage/30"
              )}
            >
              <p className="font-medium text-sm">{tag.label}</p>
              <p className="text-xs text-ink-muted mt-0.5">{tag.description}</p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-stone/60 bg-cream-dark/30 p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => update("isPaid", e.target.checked)}
              className="rounded"
            />
            This is a paid event
          </label>
          {form.isPaid && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-ink-muted">Price from ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 rounded-2xl"
                  value={form.priceMin}
                  onChange={(e) => update("priceMin", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-ink-muted">Price to ($, optional)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 rounded-2xl"
                  value={form.priceMax}
                  onChange={(e) => update("priceMax", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rsvpRequired}
              onChange={(e) => update("rsvpRequired", e.target.checked)}
              className="rounded"
            />
            Require RSVP
          </label>
          {form.rsvpRequired && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.rsvpApprovalRequired}
                  onChange={(e) => update("rsvpApprovalRequired", e.target.checked)}
                  className="rounded"
                />
                Host must approve attendees
              </label>
              <div>
                <label className="text-sm text-ink-muted">Capacity (optional)</label>
                <Input
                  type="number"
                  className="mt-1 rounded-2xl"
                  value={form.capacity}
                  onChange={(e) => update("capacity", e.target.value)}
                  placeholder="20"
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-stone/60 bg-white p-6 space-y-3 shadow-sm">
        <h2 className="font-serif text-lg font-semibold">Interest tags</h2>
        <p className="text-sm text-ink-muted">Help people find this gathering.</p>
        <div className="flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggleInterest(cat.slug)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                form.interestSlugs.includes(cat.slug)
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-cream-dark border border-stone/60 text-ink-muted hover:text-ink"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-2xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pb-8">
        <Button type="submit" disabled={loading || !canSave} className="rounded-2xl">
          {loading ? "Saving..." : "Save changes"}
        </Button>
        <Link href={`/listings/${initial.slug}`}>
          <Button type="button" variant="outline" className="rounded-2xl">
            <ArrowLeft className="h-4 w-4" />
            Back to listing
          </Button>
        </Link>
      </div>
    </form>
  );
}
