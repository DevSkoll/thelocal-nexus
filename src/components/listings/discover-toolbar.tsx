"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LISTING_CATEGORIES, LISTING_NATURE_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function buildDiscoverHref(
  base: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  const merged = { ...base, ...updates };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/discover?${qs}` : "/discover";
}

interface DiscoverToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  resultCount: number;
  totalCount: number;
}

export function DiscoverToolbar({
  searchQuery,
  onSearchChange,
  filtersOpen,
  onFiltersToggle,
  resultCount,
  totalCount,
}: DiscoverToolbarProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const nature = searchParams.get("nature") ?? undefined;
  const cost = searchParams.get("cost") ?? undefined;

  const base = { category, nature, cost };
  const activeFilterCount = [category, nature, cost].filter(Boolean).length;

  const activeChips: { key: string; label: string; href: string }[] = [];
  if (category) {
    const cat = LISTING_CATEGORIES.find((c) => c.slug === category);
    activeChips.push({
      key: "category",
      label: cat ? `${cat.icon} ${cat.name}` : category,
      href: buildDiscoverHref(base, { category: undefined }),
    });
  }
  if (cost) {
    activeChips.push({
      key: "cost",
      label: cost === "paid" ? "Paid" : "Free",
      href: buildDiscoverHref(base, { cost: undefined }),
    });
  }
  if (nature) {
    const tag = LISTING_NATURE_TAGS.find((t) => t.value === nature);
    activeChips.push({
      key: "nature",
      label: tag?.label ?? nature,
      href: buildDiscoverHref(base, { nature: undefined }),
    });
  }

  const costFilters = [
    { value: undefined, label: "All" },
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search listings..."
            className="pl-10 pr-9"
            aria-label="Search listings"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onFiltersToggle}
          className={cn(
            "shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
            filtersOpen || activeFilterCount > 0
              ? "border-sage/40 bg-sage/10 text-sage"
              : "border-stone/60 bg-white text-ink-muted hover:text-ink"
          )}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta text-[11px] font-semibold text-white px-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {(activeChips.length > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-stone/60 px-2.5 py-1 text-xs text-ink-muted">
              Search: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeChips.map((chip) => (
            <Link
              key={chip.key}
              href={chip.href}
              className="inline-flex items-center gap-1 rounded-full bg-sage/10 border border-sage/20 px-2.5 py-1 text-xs font-medium text-sage hover:bg-sage/15 transition-colors"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Link>
          ))}
          {activeFilterCount > 0 && (
            <Link
              href="/discover"
              className="text-xs text-ink-muted hover:text-terracotta transition-colors"
            >
              Clear filters
            </Link>
          )}
        </div>
      )}

      {filtersOpen && (
        <div className="rounded-xl border border-stone/60 bg-white p-4 shadow-sm space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Interest</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill
                href={buildDiscoverHref(base, { category: undefined })}
                active={!category}
                variant="terracotta"
              >
                All
              </FilterPill>
              {LISTING_CATEGORIES.map((cat) => (
                <FilterPill
                  key={cat.slug}
                  href={buildDiscoverHref(base, { category: cat.slug })}
                  active={category === cat.slug}
                  variant="terracotta"
                >
                  {cat.icon} {cat.name}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Cost</p>
              <div className="flex flex-wrap gap-1.5">
                {costFilters.map((f) => (
                  <FilterPill
                    key={f.label}
                    href={buildDiscoverHref(base, { cost: f.value })}
                    active={(cost ?? undefined) === f.value}
                    variant="terracotta"
                  >
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Host type</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  href={buildDiscoverHref(base, { nature: undefined })}
                  active={!nature}
                  variant="sage"
                >
                  All
                </FilterPill>
                {LISTING_NATURE_TAGS.map((tag) => (
                  <FilterPill
                    key={tag.value}
                    href={buildDiscoverHref(base, { nature: tag.value })}
                    active={nature === tag.value}
                    variant="sage"
                  >
                    {tag.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-ink-muted">
        {searchQuery || activeFilterCount > 0 ? (
          <>
            Showing {resultCount} of {totalCount} listing{totalCount !== 1 ? "s" : ""}
          </>
        ) : (
          <>
            {totalCount} listing{totalCount !== 1 ? "s" : ""} near you
          </>
        )}
      </p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  variant,
  children,
}: {
  href: string;
  active: boolean;
  variant: "terracotta" | "sage";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
        active
          ? variant === "terracotta"
            ? "bg-terracotta text-white"
            : "bg-sage text-white"
          : "bg-cream-dark border border-stone/50 text-ink-muted hover:text-ink hover:border-stone"
      )}
    >
      {children}
    </Link>
  );
}