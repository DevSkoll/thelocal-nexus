import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

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
            </div>
          </div>
          <p className="mt-6 text-xs text-white/50">
            No algorithmic feeds. No pay-to-be-seen. No vanity metrics. Just your community.
          </p>
          <p className="mt-2 text-xs text-white/55">
            Intentionally AI-built — helping businesses, communities, and people connect in real life.{" "}
            <Link href="/about" className="underline hover:text-white/80">Learn more</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
