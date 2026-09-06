"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Cat = { slug: string; name: string; icon: string };

export function SkillsFilters({
  categories,
  current,
}: {
  categories: Cat[];
  current: {
    interest?: string;
    priceMin?: string;
    priceMax?: string;
    minReputation?: string;
    q?: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(current.q ?? "");
  const [priceMin, setPriceMin] = useState(current.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(current.priceMax ?? "");
  const [minRep, setMinRep] = useState(current.minReputation ?? "");

  function push(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = {
      interest: current.interest,
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
      minReputation: minRep || undefined,
      q: q || undefined,
      ...next,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="rounded-3xl border border-stone/50 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => push({ interest: undefined })}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            !current.interest ? "bg-terracotta text-white shadow" : "bg-cream-dark text-ink-muted hover:text-ink"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => push({ interest: cat.slug })}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              current.interest === cat.slug
                ? "bg-sage text-white shadow"
                : "bg-cream-dark text-ink-muted hover:text-ink"
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-ink-muted">Search</label>
          <Input
            className="mt-1 rounded-2xl"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Bike repair, tutoring…"
          />
        </div>
        <div className="w-28">
          <label className="text-xs font-medium text-ink-muted">Min $</label>
          <Input className="mt-1 rounded-2xl" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} inputMode="decimal" />
        </div>
        <div className="w-28">
          <label className="text-xs font-medium text-ink-muted">Max $</label>
          <Input className="mt-1 rounded-2xl" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} inputMode="decimal" />
        </div>
        <div className="w-28">
          <label className="text-xs font-medium text-ink-muted">Min rep</label>
          <Input className="mt-1 rounded-2xl" value={minRep} onChange={(e) => setMinRep(e.target.value)} inputMode="numeric" placeholder="opt" />
        </div>
        <Button onClick={() => push({})} className="rounded-2xl">Apply</Button>
      </div>
      <p className="text-xs text-ink-muted">Min reputation is optional — default sort stays distance/recency so newcomers stay visible.</p>
    </div>
  );
}
