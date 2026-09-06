"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LISTING_CATEGORIES, RADIUS_OPTIONS } from "@/lib/constants";

interface SettingsFormProps {
  zipCode: string | null;
  locationLabel: string | null;
  radiusMiles: number;
  interestSlugs: string[];
  alertSlugs: string[];
}

export function SettingsForm({
  zipCode,
  locationLabel,
  radiusMiles,
  interestSlugs: initialInterests,
  alertSlugs: initialAlerts,
}: SettingsFormProps) {
  const router = useRouter();
  const [zip, setZip] = useState(zipCode ?? "");
  const [radius, setRadius] = useState(radiusMiles);
  const [interests, setInterests] = useState(new Set(initialInterests));
  const [alerts, setAlerts] = useState(new Set(initialAlerts));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: zip,
          radiusMiles: radius,
          interestSlugs: Array.from(interests),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setMessage("Settings saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlert(slug: string) {
    const isOn = alerts.has(slug);
    if (isOn) {
      await fetch(`/api/alerts?interestSlug=${slug}`, { method: "DELETE" });
      setAlerts((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    } else {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interestSlug: slug, radiusMiles: radius }),
      });
      setAlerts((prev) => new Set(prev).add(slug));
    }
  }

  function toggleInterest(slug: string) {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-ink-muted">Zip code</label>
        <Input
          className="mt-1 max-w-[10rem]"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="28301"
          inputMode="numeric"
          maxLength={5}
        />
        {locationLabel && (
          <p className="mt-1 text-xs text-ink-muted">Currently: {locationLabel}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-ink-muted">Search radius</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                r === radius ? "bg-terracotta text-white" : "bg-cream-dark text-ink-muted hover:text-ink"
              )}
            >
              {r} mi
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink-muted">Your interests</label>
        <p className="text-xs text-ink-muted mt-0.5 mb-2">Used to personalize discovery.</p>
        <div className="flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => toggleInterest(cat.slug)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                interests.has(cat.slug)
                  ? "bg-sage text-white"
                  : "bg-white border border-stone/60 text-ink-muted hover:text-ink"
              )}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink-muted">Interest alerts</label>
        <p className="text-xs text-ink-muted mt-0.5 mb-2">
          Opt-in only — we&apos;ll surface new listings that match. No push spam.
        </p>
        <div className="flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => toggleAlert(cat.slug)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                alerts.has(cat.slug)
                  ? "bg-terracotta text-white"
                  : "bg-white border border-stone/60 text-ink-muted hover:text-ink"
              )}
            >
              {alerts.has(cat.slug) ? "🔔" : "🔕"} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <p className={cn("text-sm font-medium", message.includes("saved") ? "text-sage" : "text-terracotta")}>
          {message}
        </p>
      )}

      <Button onClick={saveSettings} disabled={saving || zip.length < 5}>
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </div>
  );
}