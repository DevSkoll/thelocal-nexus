import Link from "next/link";
import { Shield, Home, Users, Flag } from "lucide-react";
export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sage">Safety &amp; trust</h1>
      <p className="mt-4 text-lg text-ink-muted leading-relaxed">
        We built TheLocal.nexus to feel nothing like old classifieds. Here&apos;s how we help you
        connect safely with real neighbors.
      </p>

      <div className="mt-10 space-y-8">
        {[
          {
            icon: Shield,
            title: "Verification tiers",
            body: "Your phone number verifies your account and proves you're human. Email is optional secondary contact. Verified Host status is earned through real event history and community vouches — not paid badges.",
          },
          {
            icon: Home,
            title: "Home-hosted events",
            body: "Home-hosted gatherings are 18+ only. Exact addresses are shared only after RSVP approval. We recommend meeting in a public place first when connecting with strangers.",
          },
          {
            icon: Users,
            title: "RSVP & host approval",
            body: "Hosts can require RSVPs and approve attendees before sharing private details. You always know who's coming before you open your door.",
          },
          {
            icon: Flag,
            title: "Reporting & moderation",
            body: "Every listing can be reported. Reports go to human review — not an algorithm. Repeat offenders are removed from the platform.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-stone/60 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-lg font-bold">{title}</h2>
            </div>
            <p className="mt-3 text-ink-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-terracotta/5 border border-terracotta/20 p-6">
        <h2 className="font-serif font-bold text-terracotta">First meeting tips</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted list-disc list-inside">
          <li>Meet in a public place for your first gathering</li>
          <li>Tell a friend where you&apos;re going and when you&apos;ll be back</li>
          <li>Trust your instincts — if something feels off, leave</li>
          <li>Never share financial information or send money to strangers</li>
          <li>Report suspicious listings immediately</li>
        </ul>
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        Questions? Reach out through any listing&apos;s discussion thread or{" "}
        <Link href="/discover" className="text-terracotta hover:underline">browse your local community</Link>.
      </p>
    </div>
  );
}