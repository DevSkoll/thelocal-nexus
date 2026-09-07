import Link from "next/link";
import Image from "next/image";
import { GitFork } from "lucide-react";
import { APP_NAME, GITHUB_URL } from "@/lib/constants";

const THEITGURU_URL = "https://theit.guru";
const GROKBOT_URL = "https://x.ai/bot";

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="brand-bar" />
      <div className="bg-sage text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-lg font-bold">{APP_NAME}.nexus</p>
              <p className="text-sm text-white/70 mt-1">
                Find what&apos;s happening near you. Then log off and live your life.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-white/70">
              <Link href="/groups" className="hover:text-white transition-colors">Groups</Link>
              <Link href="/skills" className="hover:text-white transition-colors">Skills</Link>
              <Link href="/suggestions" className="hover:text-white transition-colors">Ideas</Link>
              <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
              <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                Contribute
                <span className="sr-only"> on GitHub (opens in a new tab)</span>
              </a>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/50">
            No algorithmic feeds. No pay-to-be-seen. No vanity metrics. Just your community.
          </p>
          <p className="mt-2 text-xs text-white/55">
            Intentionally AI-built — helping businesses, communities, and people connect in real life.{" "}
            <Link href="/about" className="underline hover:text-white/80">Learn more</Link>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              Built with
            </p>
            <a
              href={THEITGURU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-cream/95 pl-1.5 pr-2.5 py-1 text-sage shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                <Image src="/brands/theitguru.svg" alt="" width={24} height={24} className="h-6 w-6" unoptimized />
              </span>
              <span className="text-sm font-semibold text-sage">TheITGuru</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={GROKBOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-cream/95 pl-1.5 pr-2.5 py-1 text-sage shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                <Image src="/brands/grokbot.svg" alt="" width={24} height={24} className="h-6 w-6" unoptimized />
              </span>
              <span className="text-sm font-semibold text-sage">Grok Bot</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
