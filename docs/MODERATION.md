# Moderation

On-platform report review for TheLocal.nexus. Goal: keep gatherings welcoming without exposing private contact data.

## Access

- **UI:** `/moderation` (nav link only for moderators)
- **Who:** `User.isModerator === true` **or** id/slug in env `MODERATOR_USER_IDS` (comma-separated cuids and/or slugs)
- **Demo:** Joe Martinez is seeded with `isModerator: true` — sign in with `+15035550101`

## Report lifecycle

`OPEN` → `REVIEWING` → `ACTIONED` | `DISMISSED` (can reopen to `OPEN`)

Fields: `status`, `reviewedAt`, `reviewerId`, `resolutionNote`. Existing reports default to `OPEN`.

Severe cases: moderator can **Action + cancel listing** (`PATCH` with `status: ACTIONED`, `cancelListing: true`), reusing host cancel semantics (`ListingStatus.CANCELLED`).

## Privacy

Queue APIs and UI show reporter **display name and slug only** — never phone numbers.

## Related

- [API.md](API.md) — Reports endpoints
- [DEMO-PERSONAS.md](DEMO-PERSONAS.md) — try as Joe
- [ROADMAP.md](ROADMAP.md) — shipped vs later tools
