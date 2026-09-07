"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Link2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkRow = { label: string; url: string };

const LINK_PRESETS = [
  { label: "Website", placeholder: "https://" },
  { label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { label: "Instagram", placeholder: "https://instagram.com/..." },
  { label: "X", placeholder: "https://x.com/..." },
  { label: "Facebook", placeholder: "https://facebook.com/..." },
];

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-stone/50 bg-cream/40 px-4 py-3 cursor-pointer hover:border-sage/30 transition-colors">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-stone text-terracotta focus:ring-terracotta"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-ink-muted mt-0.5 leading-snug">{hint}</span>
      </span>
    </label>
  );
}

export function ProfileEditForm({
  name,
  slug,
  headline,
  bio,
  pronouns,
  avatarUrl,
  coverImageUrl,
  showRealName,
  showLocation,
  showSkills,
  showHostedListings,
  showReputation,
  showJoinDate,
  links,
}: {
  name: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  pronouns: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  showRealName: boolean;
  showLocation: boolean;
  showSkills: boolean;
  showHostedListings: boolean;
  showReputation: boolean;
  showJoinDate: boolean;
  links: { label: string; url: string }[];
}) {
  const router = useRouter();
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name,
    slug,
    headline: headline ?? "",
    bio: bio ?? "",
    pronouns: pronouns ?? "",
    showRealName,
    showLocation,
    showSkills,
    showHostedListings,
    showReputation,
    showJoinDate,
  });
  const [linkRows, setLinkRows] = useState<LinkRow[]>(
    links.length ? links.map((l) => ({ label: l.label, url: l.url })) : []
  );
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const [coverPreview, setCoverPreview] = useState(coverImageUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [message, setMessage] = useState("");

  async function uploadImage(kind: "avatar" | "cover", file: File) {
    setUploading(kind);
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/profiles/me/${kind}`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (kind === "avatar") setAvatarPreview(data.avatarUrl);
      else setCoverPreview(data.coverImageUrl);
      setMessage(kind === "avatar" ? "Photo updated." : "Cover updated.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

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
          pronouns: form.pronouns || null,
          showRealName: form.showRealName,
          showLocation: form.showLocation,
          showSkills: form.showSkills,
          showHostedListings: form.showHostedListings,
          showReputation: form.showReputation,
          showJoinDate: form.showJoinDate,
          links: linkRows
            .filter((l) => l.label.trim() && l.url.trim())
            .map((l, i) => ({ label: l.label.trim(), url: l.url.trim(), sortOrder: i })),
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

  function addLink(preset?: { label: string }) {
    if (linkRows.length >= 12) return;
    setLinkRows([...linkRows, { label: preset?.label ?? "", url: "" }]);
  }

  return (
    <div className="space-y-8">
      {/* Photos */}
      <section>
        <h3 className="font-serif text-base font-semibold text-ink mb-3">Photos</h3>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-stone/50 bg-gradient-to-br from-sage/20 via-cream to-terracotta/10">
          <div
            className="h-36 sm:h-44 bg-cover bg-center"
            style={
              coverPreview
                ? { backgroundImage: `url(${coverPreview})` }
                : undefined
            }
          />
          <div className="absolute inset-x-0 top-0 flex justify-end p-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full gap-1.5 shadow-md"
              disabled={uploading === "cover"}
              onClick={() => coverInput.current?.click()}
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {uploading === "cover" ? "Uploading…" : "Cover"}
            </Button>
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage("cover", f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="relative -mt-10 px-5 pb-5 flex items-end gap-4">
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              disabled={uploading === "avatar"}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-terracotta to-terracotta-dark shadow-lg ring-2 ring-sage/10"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-white">
                  {form.name.charAt(0) || "?"}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/45 py-1 text-[10px] font-semibold text-white flex items-center justify-center gap-1">
                <Camera className="h-3 w-3" />
                {uploading === "avatar" ? "…" : "Edit"}
              </span>
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage("avatar", f);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-ink-muted pb-1">
              JPEG, PNG, or WebP · max 5MB. Phone stays private — never shown on your profile.
            </p>
          </div>
        </div>
      </section>

      {/* Public identity */}
      <section className="space-y-4">
        <h3 className="font-serif text-base font-semibold text-ink">Public identity</h3>
        <div>
          <label className="text-sm font-medium text-ink-muted">Display name</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Shown publicly only when &quot;Show display name&quot; is on.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted">Username (profile URL)</label>
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
          <label className="text-sm font-medium text-ink-muted">Pronouns (optional)</label>
          <Input
            className="mt-1 rounded-2xl"
            value={form.pronouns}
            onChange={(e) => setForm({ ...form, pronouns: e.target.value.slice(0, 40) })}
            placeholder="they/them"
            maxLength={40}
          />
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-3">
        <div>
          <h3 className="font-serif text-base font-semibold text-ink">Privacy</h3>
          <p className="text-xs text-ink-muted mt-1">
            You control what neighbors see. Your phone number is never public.
          </p>
        </div>
        <Toggle
          checked={form.showRealName}
          onChange={(v) => setForm({ ...form, showRealName: v })}
          label="Show display name"
          hint="Off = public profile shows your username only"
        />
        <Toggle
          checked={form.showLocation}
          onChange={(v) => setForm({ ...form, showLocation: v })}
          label="Show location"
          hint="Hides your city/neighborhood label on your public profile"
        />
        <Toggle
          checked={form.showReputation}
          onChange={(v) => setForm({ ...form, showReputation: v })}
          label="Show reputation"
          hint="Community trust score — on by default so neighbors can build trust"
        />
        <Toggle
          checked={form.showJoinDate}
          onChange={(v) => setForm({ ...form, showJoinDate: v })}
          label="Show join date"
          hint="“Member since …” on your public profile"
        />
        <Toggle
          checked={form.showSkills}
          onChange={(v) => setForm({ ...form, showSkills: v })}
          label="Show skills"
          hint="List your skill offers on your public profile"
        />
        <Toggle
          checked={form.showHostedListings}
          onChange={(v) => setForm({ ...form, showHostedListings: v })}
          label="Show hosted listings"
          hint="List your active hosted events on your public profile"
        />
      </section>

      {/* About */}
      <section className="space-y-4">
        <h3 className="font-serif text-base font-semibold text-ink">About</h3>
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
            className="mt-1 rounded-2xl min-h-[120px]"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 2000) })}
            placeholder="What should neighbors know about you?"
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-ink-muted text-right">{form.bio.length}/2000</p>
        </div>
      </section>

      {/* Links */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-base font-semibold text-ink flex items-center gap-2">
              <Link2 className="h-4 w-4 text-terracotta" />
              Links
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">Website, LinkedIn, and other places you hang out online.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {LINK_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addLink(p)}
              className="rounded-full border border-stone/60 bg-white px-3 py-1 text-xs font-semibold text-ink-muted hover:border-sage/40 hover:text-sage transition-colors"
            >
              + {p.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {linkRows.map((row, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-stone/50 bg-white p-3">
              <Input
                className="rounded-xl sm:w-36"
                placeholder="Label"
                value={row.label}
                onChange={(e) => {
                  const next = [...linkRows];
                  next[idx] = { ...next[idx], label: e.target.value.slice(0, 40) };
                  setLinkRows(next);
                }}
              />
              <Input
                className="rounded-xl flex-1"
                placeholder="https://"
                value={row.url}
                onChange={(e) => {
                  const next = [...linkRows];
                  next[idx] = { ...next[idx], url: e.target.value };
                  setLinkRows(next);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl shrink-0"
                onClick={() => setLinkRows(linkRows.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-2xl gap-1.5"
          onClick={() => addLink()}
          disabled={linkRows.length >= 12}
        >
          <Plus className="h-3.5 w-3.5" />
          Custom link
        </Button>
      </section>

      {message && (
        <p
          className={cn(
            "text-sm font-medium",
            message.toLowerCase().includes("saved") || message.toLowerCase().includes("updated")
              ? "text-sage"
              : "text-terracotta"
          )}
        >
          {message}
        </p>
      )}
      <div className="sticky bottom-3 z-10 -mx-1 rounded-[1.5rem] border border-sage/25 bg-cream/95 backdrop-blur-sm px-4 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Save public profile</p>
          <p className="text-xs text-ink-muted truncate">Bio, photos, links &amp; privacy — not your zip or alerts.</p>
        </div>
        <Button
          onClick={save}
          disabled={saving || form.name.length < 1 || form.slug.length < 2}
          className="rounded-2xl px-5 shrink-0"
        >
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
