"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProfileEditForm({
  name,
  slug,
  headline,
  bio,
}: {
  name: string;
  slug: string;
  headline: string | null;
  bio: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name,
    slug,
    headline: headline ?? "",
    bio: bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          headline: form.headline || null,
          bio: form.bio || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setMessage("Profile saved.");
      if (data.slug && data.slug !== slug) {
        router.push(`/u/${data.slug}`);
        router.refresh();
        return;
      }
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-ink-muted">Display name</label>
        <Input className="mt-1 rounded-2xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-muted">Public profile URL</label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-ink-muted">/u/</span>
          <Input
            className="rounded-2xl"
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40),
              })
            }
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-ink-muted">Headline</label>
        <Input
          className="mt-1 rounded-2xl"
          value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })}
          placeholder="Bike mechanic · weekend host"
          maxLength={120}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-muted">Bio</label>
        <Textarea
          className="mt-1 rounded-2xl min-h-[100px]"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="What should neighbors know about you?"
        />
      </div>
      {message && (
        <p className={cn("text-sm font-medium", message.includes("saved") ? "text-sage" : "text-terracotta")}>{message}</p>
      )}
      <Button onClick={save} disabled={saving || form.name.length < 1 || form.slug.length < 2} className="rounded-2xl">
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}
