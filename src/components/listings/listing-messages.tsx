"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface ListingMessagesProps {
  listingId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
}

export function ListingMessages({ listingId, isLoggedIn, currentUserId }: ListingMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/messages?listingId=${listingId}`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }, [listingId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, body }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setBody("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone/60 bg-white p-6">
      <h2 className="font-serif text-lg font-semibold">Listing discussion</h2>
      <p className="text-sm text-ink-muted mt-1">
        Questions and coordination — scoped to this listing only.
      </p>

      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-ink-muted">No messages yet. Ask a question!</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl p-3 text-sm ${
              msg.user.id === currentUserId ? "bg-sage/10 ml-4" : "bg-cream-dark mr-4"
            }`}
          >
            <p className="font-medium text-xs text-ink-muted mb-1">
              {msg.user.name} · {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
            </p>
            <p>{msg.body}</p>
          </div>
        ))}
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSend} className="mt-4 flex gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask the host a question..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading} size="sm">
            Send
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-ink-muted">
          <a href="/login" className="text-terracotta hover:underline">Sign in</a> to join the discussion.
        </p>
      )}
    </div>
  );
}