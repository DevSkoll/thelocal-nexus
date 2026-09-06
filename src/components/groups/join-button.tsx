"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface JoinButtonProps {
  groupId: string;
  groupName: string;
  isMember: boolean;
  isLoggedIn: boolean;
}

export function JoinButton({ groupId, groupName, isMember, isLoggedIn }: JoinButtonProps) {
  const router = useRouter();
  const [joined, setJoined] = useState(isMember);
  const [loading, setLoading] = useState(false);

  if (joined) {
    return (
      <span className="inline-flex items-center rounded-xl bg-sage/10 border border-sage/20 px-5 py-2.5 text-sm font-semibold text-sage">
        You&apos;re a member
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <a href="/login">
        <Button>Sign in to join</Button>
      </a>
    );
  }

  async function handleJoin() {
    setLoading(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (res.ok) {
        setJoined(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleJoin} disabled={loading} className="shadow-sm">
      {loading ? "Joining..." : `Join ${groupName}`}
    </Button>
  );
}