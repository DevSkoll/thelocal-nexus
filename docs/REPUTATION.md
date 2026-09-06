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
| `VOUCH` | +8 | Peer vouch (future UI) |
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
