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
            <div className="flex gap-6 text-sm text-white/70">
              <a href="/safety" className="hover:text-white transition-colors">Safety</a>
              <a href="/discover" className="hover:text-white transition-colors">Discover</a>
              <a href="/settings" className="hover:text-white transition-colors">Settings</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/50">
            No algorithmic feeds. No pay-to-be-seen. No vanity metrics. Just your community.
          </p>
        </div>
      </div>
    </footer>
  );
}