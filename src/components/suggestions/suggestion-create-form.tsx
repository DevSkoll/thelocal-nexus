"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SuggestionCreateForm({
  isLoggedIn,
  phoneVerified,
}: {
  isLoggedIn: boolean;
  phoneVerified: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-stone/60 bg-white/80 p-5 text-center">
        <p className="text-sm text-ink-muted">
          <Link href="/login" className="text-terracotta font-semibold hover:underline">
            Sign in with your phone
          </Link>{" "}
          to propose an idea and vote.
        </p>
      </div>
    );
  }

  if (!phoneVerified) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-stone/60 bg-white/80 p-5 text-center">
        <p className="text-sm text-ink-muted">
          Phone verification is required to submit ideas (keeps spam out).
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setTitle("");
      setBody("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[1.75rem] border border-sage/20 bg-gradient-to-br from-white to-cream-dark p-5 text-left shadow-sm hover:shadow-md hover:border-terracotta/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif font-bold text-ink">Got an idea for TheLocal?</p>
            <p className="text-sm text-ink-muted">Share it with neighbors — equal votes, no paid boosts.</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-sage/25 bg-white p-5 sm:p-6 shadow-md space-y-4"
    >
      <div className="flex items-center gap-2 text-sage">
        <Lightbulb className="h-5 w-5 text-terracotta" />
        <h2 className="font-serif text-lg font-bold text-ink">Propose an idea</h2>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="suggestion-title">
          Title
        </label>
        <Input
          id="suggestion-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Calendar view for recurring events"
          maxLength={120}
          required
          className="rounded-2xl"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="suggestion-body">
          Why it helps the community
        </label>
        <Textarea
          id="suggestion-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="A short pitch — who it helps and why it belongs on TheLocal."
          maxLength={5000}
          required
          className="rounded-2xl min-h-[100px]"
        />
      </div>
      {error && <p className="text-sm text-terracotta font-medium">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading} className="rounded-2xl">
          {loading ? "Submitting…" : "Submit idea"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="rounded-2xl"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
