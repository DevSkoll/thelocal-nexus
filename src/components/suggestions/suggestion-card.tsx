import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./vote-button";
import { StatusControls } from "./status-controls";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  PLANNED: "Planned",
  DONE: "Done",
  CLOSED: "Closed",
};

function statusVariant(status: string): "default" | "verified" | "type" | "interest" {
  if (status === "PLANNED") return "verified";
  if (status === "DONE") return "interest";
  if (status === "CLOSED") return "default";
  return "type";
}

export type SuggestionCardData = {
  id: string;
  title: string;
  body: string;
  status: string;
  voteCount: number;
  createdAt: Date;
  viewerHasVoted: boolean;
  author: { name: string; slug: string };
};

export function SuggestionCard({
  suggestion,
  isLoggedIn,
  phoneVerified,
  isModerator,
}: {
  suggestion: SuggestionCardData;
  isLoggedIn: boolean;
  phoneVerified: boolean;
  isModerator: boolean;
}) {
  return (
    <article className="rounded-[1.75rem] border border-stone/40 bg-white p-5 shadow-sm hover:shadow-md hover:border-sage/25 transition-all">
      <div className="flex gap-4">
        <VoteButton
          suggestionId={suggestion.id}
          voteCount={suggestion.voteCount}
          hasVoted={suggestion.viewerHasVoted}
          isLoggedIn={isLoggedIn}
          phoneVerified={phoneVerified}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant={statusVariant(suggestion.status)}>
              {STATUS_LABEL[suggestion.status] ?? suggestion.status}
            </Badge>
            <span className="text-xs text-ink-muted">
              {formatDistanceToNow(suggestion.createdAt, { addSuffix: true })}
            </span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-ink leading-snug">
            {suggestion.title}
          </h2>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
            {suggestion.body}
          </p>
          <p className="mt-3 text-xs text-ink-muted">
            Proposed by{" "}
            <Link
              href={`/u/${suggestion.author.slug}`}
              className="text-sage font-medium hover:underline"
            >
              {suggestion.author.name}
            </Link>
          </p>
          {isModerator && (
            <StatusControls suggestionId={suggestion.id} status={suggestion.status} />
          )}
        </div>
      </div>
    </article>
  );
}
