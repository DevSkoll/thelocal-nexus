import Link from "next/link";
import { Sparkles, Users, Building2, Heart } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `About · ${APP_NAME}`,
  description: "TheLocal is intentionally AI-built — helping businesses, communities, and neighbors connect in real life.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-[2rem] bg-gradient-to-br from-sage to-sage-dark text-white p-8 sm:p-10 shadow-lg">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
          <Sparkles className="h-4 w-4" /> Intentionally AI-built
        </p>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold leading-tight">
          Built with AI. Open to the community.
        </h1>
        <p className="mt-4 text-white/85 text-lg leading-relaxed">
          {APP_NAME}.nexus is proudly AI-assisted — not as a gimmick, but as a way to ship faster for real neighbors,
          local businesses, and community organizers who want people meeting offline.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Building2, title: "Businesses", body: "Local shops and venues can list gatherings without paying to be seen." },
          { icon: Users, title: "Communities", body: "Groups get equal discovery — distance and recency, not algorithms." },
          { icon: Heart, title: "People", body: "Skills, trust, and profiles that help you find the right neighbor." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-3xl border border-stone/50 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-3 font-serif text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-stone/50 bg-cream/70 p-6 leading-relaxed text-ink-muted">
        <p>
          AI helps us draft, iterate, and maintain TheLocal — humans set the product rules: listings not feeds,
          phone-first privacy, no vanity metrics, and no pay-to-boost. We celebrate that collaboration openly.
        </p>
        <p className="mt-4">
          Curious how trust works? Read{" "}
          <Link href="/safety" className="text-terracotta font-semibold hover:underline">Safety &amp; trust</Link>
          {" "}or browse{" "}
          <Link href="/skills" className="text-terracotta font-semibold hover:underline">skills near you</Link>.
        </p>
      </div>
    </div>
  );
}
