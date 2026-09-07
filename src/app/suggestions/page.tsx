import Link from "next/link";
import { MessageCircleHeart, Sparkles } from "lucide-react";
import { getCurrentUser, isPhoneVerified } from "@/lib/auth";
import { isModerator } from "@/lib/moderation";
import { listSuggestions } from "@/lib/suggestions";
import { SuggestionCreateForm } from "@/components/suggestions/suggestion-create-form";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { cn } from "@/lib/utils";

interface SuggestionsPageProps {
  searchParams: Promise<{ sort?: string; status?: string }>;
}

export const metadata = {
  title: "Suggestion box · TheLocal",
  description:
    "Propose features and ideas for TheLocal. Equal votes for phone-verified neighbors — no paid boosts.",
};

export default async function SuggestionsPage({ searchParams }: SuggestionsPageProps) {
  const params = await searchParams;
  const sort = params.sort === "top" ? "top" : "new";
  const statusFilter =
    params.status === "OPEN" ||
    params.status === "PLANNED" ||
    params.status === "DONE" ||
    params.status === "CLOSED"
      ? params.status
      : "ALL";

  const user = await getCurrentUser();
  const phoneVerified = user ? isPhoneVerified(user) : false;
  const moderator = user ? isModerator(user) : false;

  const suggestions = await listSuggestions({
    sort,
    status: statusFilter,
    viewerId: user?.id,
  });

  function hrefFor(next: { sort?: string; status?: string }) {
    const sp = new URLSearchParams();
    const s = next.sort ?? sort;
    const st = next.status ?? statusFilter;
    if (s === "top") sp.set("sort", "top");
    if (st !== "ALL") sp.set("status", st);
    const q = sp.toString();
    return q ? `/suggestions?${q}` : "/suggestions";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-sage to-sage-dark text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-terracotta/20 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <MessageCircleHeart className="h-4 w-4" />
            Community suggestion box
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold">Shape what we build next</h1>
          <p className="mt-2 text-white/80 max-w-xl leading-relaxed">
            Pitch an idea, upvote what helps neighbors meet in real life. Equal visibility — no paid
            boosts, no burying newcomers. Phone-verified folks only, to keep spam out.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/70 bg-white/10 rounded-full px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            Votes are a community signal — not vanity metrics
          </p>
        </div>
      </div>

      <div className="mb-5">
        <SuggestionCreateForm isLoggedIn={Boolean(user)} phoneVerified={phoneVerified} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex rounded-2xl bg-cream border border-stone/40 p-1 shadow-sm">
          <Link
            href={hrefFor({ sort: "new" })}
            className={cn(
              "rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors",
              sort === "new" ? "bg-white text-sage shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            New
          </Link>
          <Link
            href={hrefFor({ sort: "top" })}
            className={cn(
              "rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors",
              sort === "top" ? "bg-white text-sage shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            Top
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "ALL", label: "All" },
            { value: "OPEN", label: "Open" },
            { value: "PLANNED", label: "Planned" },
            { value: "DONE", label: "Done" },
          ].map((t) => {
            const active = statusFilter === t.value;
            return (
              <Link
                key={t.value}
                href={hrefFor({ status: t.value })}
                className={
                  active
                    ? "rounded-full bg-terracotta text-white px-3 py-1 text-xs font-semibold shadow-sm"
                    : "rounded-full bg-white text-ink-muted hover:text-ink border border-stone/40 px-3 py-1 text-xs font-medium"
                }
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-ink-muted mb-4">
        {suggestions.length} idea{suggestions.length === 1 ? "" : "s"} · sorted by{" "}
        {sort === "top" ? "votes" : "newest first"}
      </p>

      <div className="space-y-4">
        {suggestions.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            isLoggedIn={Boolean(user)}
            phoneVerified={phoneVerified}
            isModerator={moderator}
          />
        ))}
      </div>

      {suggestions.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-stone/60 bg-cream/60 p-10 text-center">
          <p className="font-serif text-lg font-bold text-ink">No ideas here yet</p>
          <p className="mt-2 text-sm text-ink-muted">
            Be the first to propose something that helps neighbors connect.
          </p>
        </div>
      )}
    </div>
  );
}
