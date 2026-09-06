import Link from "next/link";
import { Plus, Search, User, LayoutDashboard, Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { isModerator } from "@/lib/moderation";
import { getAreaPreference } from "@/lib/location";
import { LocationMenu } from "./location-menu";
import { Button } from "@/components/ui/button";

export async function Header() {
  const [user, area] = await Promise.all([getCurrentUser(), getAreaPreference()]);
  const showModeration = user ? isModerator(user) : false;

  return (
    <header className="sticky top-0 z-50">
      <div className="brand-bar" />
      <div className="border-b border-sage-dark/30 bg-sage text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 sm:gap-4 px-4">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-white font-serif text-lg font-bold shadow-sm ring-2 ring-white/20">
              L
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-lg font-bold text-white group-hover:text-white/90 transition-colors">
                {APP_NAME}
              </span>
              <span className="text-white/60 text-xs block -mt-0.5">
                Near {area.locationLabel}
              </span>
            </div>
          </Link>

          <LocationMenu area={area} />

          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              href="/discover"
              className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/groups"
              className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Groups
            </Link>
            <Link
              href="/skills"
              className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Skills
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            {user && (
              <Link
                href="/host"
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Host</span>
              </Link>
            )}
            {showModeration && (
              <Link
                href="/moderation"
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Moderation</span>
              </Link>
            )}
            <Link href="/post">
              <Button size="sm" className="gap-1.5 shadow-md">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Post</span>
              </Button>
            </Link>
            <Link
              href={user ? (user.slug ? `/u/${user.slug}` : "/settings") : "/login"}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}