"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LISTING_TYPES, LISTING_CATEGORIES, LISTING_NATURE_TAGS } from "@/lib/constants";
import { RecurrenceFields } from "@/components/listings/recurrence-fields";
import { cn } from "@/lib/utils";

interface PostFormProps {
  userId: string;
  userGroups: { id: string; name: string }[];
  defaultLocation: { lat: number; lng: number; label: string };
  initialGroupId?: string;
  /** Deep-link from Discover: /post?type=VOLUNTEER */
  initialType?: string;
}

const VALID_LISTING_TYPE_VALUES = new Set(LISTING_TYPES.map((x) => x.value));

export function PostForm({ userId, userGroups, defaultLocation, initialGroupId, initialType }: PostFormProps) {
  const router = useRouter();
  const resolvedInitialType =
    initialType && VALID_LISTING_TYPE_VALUES.has(initialType as (typeof LISTING_TYPES)[number]["value"])
      ? initialType
      : "";
  const [step, setStep] = useState(resolvedInitialType ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialAsGroup =
    !!initialGroupId && userGroups.some((g) => g.id === initialGroupId);

  const [form, setForm] = useState({
    type: resolvedInitialType,
    title: "",
    description: "",
    locationLabel: defaultLocation.label,
    latitude: defaultLocation.lat,
    longitude: defaultLocation.lng,
    locationPrecision: "APPROXIMATE",
    startsAt: "",
    endsAt: "",
    recurrenceRule: "",
    capacity: "",
    rsvpRequired: resolvedInitialType ? !["HANGOUT_SPOT", "GROUP_SEEKING", "LOOKING_FOR"].includes(resolvedInitialType) : false,
    rsvpApprovalRequired: false,
    homeHosted: false,
    posterType: initialAsGroup ? "GROUP" : "PERSON",
    posterGroupId: initialAsGroup ? initialGroupId! : "",
    isPaid: false,
    priceMin: "",
    priceMax: "",
    natureTag: initialAsGroup ? "ORGANIZATION" : "INDIVIDUAL",
    interestSlugs: [] as string[],
  });

  function update(field: string, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId,
          isPaid: form.type === "VOLUNTEER" ? false : form.isPaid,
          priceMin: form.type === "VOLUNTEER" ? "" : form.priceMin,
          priceMax: form.type === "VOLUNTEER" ? "" : form.priceMax,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create listing");
      router.push(`/listings/${data.slug}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const steps = ["Type", "Details", "Location", "Settings", "Tags"];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex gap-1 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={cn(
                "h-1 rounded-full transition-colors",
                step > i + 1 ? "bg-terracotta" : step === i + 1 ? "bg-terracotta/60" : "bg-stone/40"
              )}
            />
            <p className={cn("text-xs mt-1.5", step === i + 1 ? "text-ink" : "text-ink-muted")}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">What are you posting?</h2>
          <p className="text-sm text-ink-muted">Choose the type that best fits. Free, always.</p>
          <div className="grid gap-2 mt-4">
            {LISTING_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    type: type.value,
                    rsvpRequired: !["HANGOUT_SPOT", "GROUP_SEEKING", "LOOKING_FOR"].includes(type.value),
                    recurrenceRule:
                      type.value === "RECURRING_EVENT" && !prev.recurrenceRule
                        ? "weekly:saturday:09:00"
                        : prev.recurrenceRule,
                  }));
                  setStep(2);
                }}
                className={cn(
                  "text-left rounded-xl border p-4 transition-colors",
                  form.type === type.value
                    ? "border-terracotta bg-terracotta/5"
                    : "border-stone/60 hover:border-terracotta/30"
                )}
              >
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-ink-muted mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">Tell people about it</h2>

          {form.type === "VOLUNTEER" && (
            <div className="rounded-2xl border border-sage/30 bg-sage/5 p-4 text-sm">
              <p className="font-semibold text-sage">Volunteer opportunities are unpaid</p>
              <p className="mt-1 text-ink-muted">
                Use this for cleanups, food drives, mutual aid, and other free community work.
                Offering a skill or charging for help?{" "}
                <Link href="/skills/new" className="font-medium text-terracotta hover:underline">
                  Post a skill offer instead
                </Link>
                .
              </p>
            </div>
          )}

          {userGroups.length > 0 && (
            <div className="rounded-2xl border border-sage/25 bg-sage/5 p-4">
              <label className="text-sm font-semibold text-sage">Post as my group</label>
              <p className="mt-0.5 text-xs text-ink-muted">
                Groups you admin can host listings with equal discovery — no boosts.
              </p>
              <select
                className="mt-2 w-full rounded-xl border border-stone bg-white px-4 py-2.5"
                value={form.posterGroupId ? `group:${form.posterGroupId}` : "person"}
                onChange={(e) => {
                  if (e.target.value.startsWith("group:")) {
                    update("posterType", "GROUP");
                    update("posterGroupId", e.target.value.replace("group:", ""));
                    update("natureTag", "ORGANIZATION");
                  } else {
                    update("posterType", "PERSON");
                    update("posterGroupId", "");
                    update("natureTag", "INDIVIDUAL");
                  }
                }}
              >
                <option value="person">Myself</option>
                {userGroups.map((g) => (
                  <option key={g.id} value={`group:${g.id}`}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-ink-muted">Title</label>
            <Input
              className="mt-1"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Saturday Morning Urban Ride"
            />
          </div>
          <div>
            <label className="text-sm text-ink-muted">Description</label>
            <Textarea
              className="mt-1"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What should people know? Who is this for?"
            />
          </div>

          {["ONE_TIME_EVENT", "VOLUNTEER", "WORKSHOP"].includes(form.type) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-ink-muted">Starts</label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={form.startsAt}
                  onChange={(e) => update("startsAt", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-ink-muted">Ends</label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={form.endsAt}
                  onChange={(e) => update("endsAt", e.target.value)}
                />
              </div>
            </div>
          )}

          {["RECURRING_EVENT", "HANGOUT_SPOT"].includes(form.type) && (
            <RecurrenceFields
              value={form.recurrenceRule}
              onChange={(rule) => update("recurrenceRule", rule)}
              optional={form.type !== "RECURRING_EVENT"}
            />
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!form.title || !form.description}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">Where is it?</h2>
          <div>
            <label className="text-sm text-ink-muted">Location label</label>
            <Input
              className="mt-1"
              value={form.locationLabel}
              onChange={(e) => update("locationLabel", e.target.value)}
              placeholder="Waterfront Park, Portland"
            />
          </div>
          <div>
            <label className="text-sm text-ink-muted">Location precision</label>
            <select
              className="mt-1 w-full rounded-xl border border-stone bg-white px-4 py-2.5"
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
            This is hosted at a private residence (18+)
          </label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)} disabled={!form.locationLabel}>Continue</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="font-serif text-xl font-semibold">Settings &amp; tags</h2>

          <div>
            <label className="text-sm font-medium text-ink-muted">What best describes this?</label>
            <p className="text-xs text-ink-muted mt-0.5 mb-2">Pick one — the scale and who&apos;s hosting.</p>
            <div className="grid gap-2">
              {LISTING_NATURE_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => update("natureTag", tag.value)}
                  className={cn(
                    "text-left rounded-xl border p-3 transition-colors",
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
          </div>

          <div className="rounded-xl border border-stone/60 p-4 space-y-3">
            {form.type === "VOLUNTEER" ? (
              <p className="text-sm text-ink-muted">
                <span className="font-medium text-ink">Volunteer listings stay free.</span>{" "}
                No price — neighbors join to help, not to hire. Skills &amp; paid help go under{" "}
                <Link href="/skills/new" className="text-terracotta hover:underline">
                  Offer a skill
                </Link>
                .
              </p>
            ) : (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => update("isPaid", e.target.checked)}
                className="rounded"
              />
              This is a paid event
            </label>
            )}
            {form.isPaid && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-ink-muted">Price from ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1"
                    value={form.priceMin}
                    onChange={(e) => update("priceMin", e.target.value)}
                    placeholder="15"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-ink-muted">Price to ($, optional)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1"
                    value={form.priceMax}
                    onChange={(e) => update("priceMax", e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink-muted mb-2">RSVP</p>
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
              <div className="mt-2 space-y-2 pl-0">
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
                    className="mt-1"
                    value={form.capacity}
                    onChange={(e) => update("capacity", e.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button
              onClick={() => setStep(5)}
              disabled={form.isPaid && !form.priceMin}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">Interest tags</h2>
          <p className="text-sm text-ink-muted">Select every topic that fits. All of them show on the listing.</p>
          <div className="flex flex-wrap gap-2">
            {LISTING_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    interestSlugs: prev.interestSlugs.includes(cat.slug)
                      ? prev.interestSlugs.filter((s) => s !== cat.slug)
                      : [...prev.interestSlugs, cat.slug],
                  }));
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  form.interestSlugs.includes(cat.slug)
                    ? "bg-terracotta text-white"
                    : "bg-white border border-stone/60 text-ink-muted hover:text-ink"
                )}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
            <Button onClick={handleSubmit} disabled={loading || form.interestSlugs.length === 0}>
              {loading ? "Publishing..." : "Publish listing"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}