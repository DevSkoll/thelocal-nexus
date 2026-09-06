"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "PLANNED", label: "Planned" },
  { value: "DONE", label: "Done" },
  { value: "CLOSED", label: "Closed" },
] as const;

export function StatusControls({
  suggestionId,
  status,
}: {
  suggestionId: string;
  status: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function setStatus(next: string) {
    if (next === current || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setCurrent(next);
      router.refresh();
    } catch {
      // keep previous status on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone/30">
      <span className="text-[10px] uppercase tracking-wide text-ink-muted font-semibold self-center mr-1">
        Mod
      </span>
      {STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          disabled={loading}
          onClick={() => setStatus(s.value)}
          className={
            current === s.value
              ? "rounded-full bg-sage text-white px-2.5 py-0.5 text-[11px] font-semibold"
              : "rounded-full bg-cream-dark text-ink-muted hover:text-ink border border-stone/40 px-2.5 py-0.5 text-[11px] font-medium"
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
