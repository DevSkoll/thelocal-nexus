# Reputation

Modular trust for TheLocal.nexus. Reputation is a **ledger + cached score**, not a vanity metric and never a discovery ranking default.

## Principles

- **Equal discovery:** seekers *may* filter by min reputation; default skill/listing sort is **distance or recency** — never reputation alone.
- **Earned, not bought:** no paid boosts, no purchasable Verified Host.
- **Phone-first:** Verified Host promotion requires `phoneVerifiedAt` plus score threshold.
- **Append-only ledger:** `ReputationEvent` rows are written; `User.reputationScore` is a cache updated by `applyEvent`.

## Points (v1)

| Reason | Points | Notes |
|--------|-------:|-------|
| `EVENT_HOSTED` | +10 | Hosted a real listing/event |
| `EVENT_COMPLETED` | +5 | Attended/completed participation |
| `POSITIVE_FEEDBACK` | +3 | Rating ≥ 4 via feedback API |
| `NEGATIVE_FEEDBACK` | −5 | Rating ≤ 2 |
| `VOUCH` | +8 | Peer vouch via profile button (once per pair) |
| `REPORT_UPHELD` | −15 | Moderation upholds a report |
| `SKILL_COMPLETED` | +5 | Positive skill-context feedback |
| `PROFILE_COMPLETED` | +5 | One-time when headline + bio set |

Constants live in `src/lib/reputation/constants.ts`.

## Verified Host

- Threshold: **`VERIFIED_HOST_THRESHOLD = 50`**
- Requirements: phone verified **and** score ≥ threshold
- Applied automatically inside `applyEvent` → `maybePromoteVerifiedHost`
- Separate from phone OTP identity

## Public summary

`getPublicTrustSummary(userId)` returns score + counts (events, positive/negative feedback, vouches) and badges — **never** raw phone numbers.

## Feedback gating

`POST /api/feedback` requires shared listing RSVP/host relationship **or** skill-offer context involving the offer owner. One feedback per pair per context.

## Module

`src/lib/reputation/` — `applyEvent`, `getPublicTrustSummary`, point constants.


## Listing completion

Hosts can **Mark completed** on a listing (`POST /api/listings/complete`). That sets `Listing.status = COMPLETED` and idempotently awards:

- `EVENT_HOSTED` (+10) to the listing host (`posterUserId`, or acting host for group posts)
- `EVENT_COMPLETED` (+5) to each approved `GOING` attendee (excluding the host)

Re-running complete does not double-award (ledger match on subject + listing + reason).

## Vouch API

`POST /api/vouch` with `{ toUserId }` or `{ toSlug }` — phone-verified actors only; one vouch per actor→subject pair.
