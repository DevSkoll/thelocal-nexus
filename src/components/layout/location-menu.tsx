"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RADIUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AreaPreference } from "@/lib/area-cookie";

interface LocationMenuProps {
  area: AreaPreference;
}

export function LocationMenu({ area }: LocationMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [zip, setZip] = useState(area.zipCode);
  const [radius, setRadius] = useState(area.radiusMiles);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZip(area.zipCode);
    setRadius(area.radiusMiles);
  }, [area.zipCode, area.radiusMiles]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleApply() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/area", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode: zip, radiusMiles: radius }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update location");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 transition-colors max-w-[200px] sm:max-w-none"
        aria-expanded={open}
      >
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate hidden sm:inline">{area.locationLabel}</span>
        <span className="truncate sm:hidden">{area.zipCode}</span>
        <span className="text-white/60 text-xs shrink-0 hidden sm:inline">· {area.radiusMiles} mi</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-stone/60 bg-white p-4 shadow-lg z-50 text-ink">
          <p className="text-sm font-medium text-ink">Your area</p>
          <p className="text-xs text-ink-muted mt-0.5">
            Listings shown within your chosen radius of this zip.
          </p>

          <div className="mt-4">
            <label className="text-xs font-medium text-ink-muted">Zip code</label>
            <Input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="28301"
              inputMode="numeric"
              maxLength={5}
              className="mt-1"
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-ink-muted">Radius</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    r === radius
                      ? "bg-terracotta text-white"
                      : "bg-cream-dark text-ink-muted hover:text-ink"
                  )}
                >
                  {r} mi
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}

          <Button
            size="sm"
            className="w-full mt-4"
            onClick={handleApply}
            disabled={saving || zip.length < 5}
          >
            {saving ? "Updating..." : "Apply"}
          </Button>
        </div>
      )}
    </div>
  );
}