"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  compact = false,
}: {
  className?: string;
  /** Nav-style: no Button chrome, just a link-like control. */
  compact?: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors",
          className
        )}
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={cn("gap-1.5 text-ink-muted", className)}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
