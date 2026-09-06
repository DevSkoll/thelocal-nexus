"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoteButton({
  suggestionId,
  voteCount,
  hasVoted,
  isLoggedIn,
  phoneVerified,
}: {
  suggestionId: string;
  voteCount: number;
  hasVoted: boolean;
  isLoggedIn: boolean;
  phoneVerified: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(voteCount);
  const [voted, setVoted] = useState(hasVoted);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!phoneVerified) {
      setMessage("Phone verification required to vote.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/vote`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not vote");
      setVoted(Boolean(data.voted));
      setCount(Number(data.voteCount));
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={voted}
        aria-label={voted ? "Remove vote" : "Upvote"}
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border px-3 py-2 min-w-[3.25rem] transition-all shadow-sm",
          voted
            ? "bg-terracotta text-white border-terracotta-dark/40 ring-2 ring-terracotta/25"
            : "bg-white text-sage border-stone/50 hover:border-terracotta/40 hover:bg-terracotta/5",
          loading && "opacity-60"
        )}
      >
        <ChevronUp className={cn("h-5 w-5", voted ? "text-white" : "text-terracotta")} />
        <span className="text-sm font-bold tabular-nums leading-none mt-0.5">{count}</span>
      </button>
      {message && (
        <p className="text-[10px] text-terracotta font-medium max-w-[5.5rem] text-center leading-tight">
          {message}
        </p>
      )}
    </div>
  );
}
