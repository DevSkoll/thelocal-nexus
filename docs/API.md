# API Reference

All endpoints return JSON. Errors use `{ error: string }` with an appropriate HTTP status.

Authentication: session cookie `thelocal_user_id` set after phone OTP verification.

Privileged actions (create listing, post comment) require `phoneVerifiedAt` — returns 403 otherwise.

## Auth

### `POST /api/auth/phone/send`

Send OTP to phone. Uses Twilio Verify when env vars set; mock SMS in dev (returns `devCode`).

**Body:** `{ "phone": "(503) 555-0101" }`

**Response:** `{ ok: true, phone: "+15035550101", mock: true, devCode?: "123456" }`

### `POST /api/auth/phone/verify`

Verify OTP, find-or-create user, set `phoneVerifiedAt`, set session cookie.

**Body:** `{ "phone": "+15035550101", "code": "123456", "name?": "Display name" }`

**Response:** `{ ok: true, user: { id, name, isNew } }`

Account recovery uses the same flow — no separate password reset.

### `POST /api/auth/logout`

Clears session cookie.

## Listings

### `POST /api/listings`

Create a listing. Requires verified phone (403 if not).

**Body (key fields):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| type | ListingType | yes | ONE_TIME_EVENT, RECURRING_EVENT, etc. |
| title | string | yes | 3–120 chars |
| description | string | yes | 10–5000 chars |
| locationLabel | string | yes | |
| latitude, longitude | number | yes | |
| natureTag | ListingNatureTag | yes | Single nature classification |
| interestSlugs | string[] | yes | Min 1 interest slug |
| isPaid | boolean | no | Default false |
| priceMin, priceMax | number | if paid | Required when isPaid |
| rsvpRequired | boolean | no | |
| rsvpApprovalRequired | boolean | no | |
| homeHosted | boolean | no | |
| startsAt, endsAt | ISO string | no | |
| recurrenceRule | string | no | e.g. `weekly:saturday:09:00` |
| capacity | string | no | Parsed as int |
| posterType | PosterType | no | Default PERSON |
| posterGroupId | string | if GROUP/ORGANIZATION | Must be a group the user admins |

When `posterType` is `GROUP` or `ORGANIZATION`, the caller must be an **ADMIN** of `posterGroupId` (403 otherwise). `posterUserId` is left null; host tools treat group admins as hosts.

**Response:** `{ slug, id }`

### `PATCH /api/listings/:id`

Update an active listing. Host only. Requires verified phone.

**Body:** Same editable fields as create (title, description, location, times, capacity, prices, RSVP flags, natureTag, interestSlugs, type). Does not change poster, slug, or status.

**Rules:**
- 403 if not the listing host
- 400 if listing is not ACTIVE

**Response:** `{ ok: true, slug, id }`

### `POST /api/listings/cancel`

Cancel a listing (status → CANCELLED). Host only. Idempotent. Does not delete history.

**Body:** `{ "listingId": "<cuid>" }`

**Rules:**
- Already CANCELLED → `{ ok: true, status: "CANCELLED" }`
- COMPLETED → 400
- Preserves RSVPs, messages, announcements

**Response:** `{ ok: true, status: "CANCELLED" }`

### `POST /api/listings/complete`

Mark listing COMPLETED and award EVENT_HOSTED / EVENT_COMPLETED reputation. Host only. Idempotent awards.

**Body:** `{ "listingId": "<cuid>" }`

**Response:** `{ ok: true, status: "COMPLETED", awarded: boolean }`

## RSVP

### `POST /api/rsvp`

Requires auth.

**Body:**
```json
{
  "listingId": "<cuid>",
  "status": "GOING" | "INTERESTED",
  "message": "optional note to host"
}
```

**Rules:**
- Home-hosted listings block GOING for UNVERIFIED users (403)
- When `rsvpApprovalRequired` is true, GOING RSVPs start with `approved: false`

### `POST /api/rsvp/approve`

Host only. Requires auth.

**Body:**
```json
{ "rsvpId": "<cuid>", "approved": true }
```

## Settings

### `PATCH /api/settings`

Requires auth. Updates user profile.

**Body:**
```json
{
  "locationLabel": "Portland, OR",
  "latitude": 45.52,
  "longitude": -122.67,
  "radiusMiles": 15,
  "interestSlugs": ["cycling", "music"]
}
```

## Alerts

### `POST /api/alerts`

Requires auth. Upserts interest alert.

**Body:**
```json
{ "interestSlug": "cycling", "radiusMiles": 15 }
```

### `DELETE /api/alerts?interestSlug=cycling`

Requires auth. Removes alert for interest.

## Messages

### `GET /api/messages?listingId=<cuid>`

Public. Returns up to 50 messages with user names.

### `POST /api/messages`

Requires auth.

**Body:**
```json
{ "listingId": "<cuid>", "body": "message text" }
```

## Announcements

### `GET /api/announcements?listingId=<cuid>`

Public. Returns up to 10 host announcements.

### `POST /api/announcements`

Host only. Requires auth.

**Body:**
```json
{ "listingId": "<cuid>", "body": "announcement text" }
```

## Reports

### `POST /api/reports`

Requires auth. Creates a report with status `OPEN`.

**Body:**
```json
{
  "listingId": "<cuid>",
  "reason": "SPAM" | "SAFETY" | "MISLEADING" | "INAPPROPRIATE" | "OTHER",
  "details": "optional context"
}
```

### `GET /api/reports?status=OPEN`

Moderator only. Lists reports (newest first). Filter: `OPEN` | `REVIEWING` | `ACTIONED` | `DISMISSED` | `ALL` (default `OPEN`).

Response includes listing title/slug/status, reporter **display name + slug only** (never phone), optional resolution fields.

### `PATCH /api/reports/[id]`

Moderator only. Update moderation state.

**Body:**
```json
{
  "status": "OPEN" | "REVIEWING" | "ACTIONED" | "DISMISSED",
  "resolutionNote": "optional note",
  "cancelListing": false
}
```

When `cancelListing: true`, `status` must be `ACTIONED` — listing is set to `CANCELLED` (same semantics as host cancel; completed listings cannot be cancelled).

## Groups

### `POST /api/groups`

Requires phone-verified auth. Creates a group and adds the creator as `ADMIN`.

**Body:**
```json
{
  "name": "string (3–120)",
  "description": "string (10–5000)",
  "type": "COMMUNITY" | "ORGANIZATION" | "BUSINESS",
  "latitude": 45.52,
  "longitude": -122.67,
  "locationLabel": "Portland, OR",
  "coverImageUrl": "https://…"
}
```

Location and cover fields are optional. Slug is derived from `name` and made unique. Returns `{ slug, id }`.

### `GET /api/groups`

Lists groups. Query: `lat`, `lng`, `radiusMiles`, `type`, `q`.

### `POST /api/groups/join`

Requires auth.

**Body:**
```json
{ "groupId": "<cuid>" }
```

Returns 409 if already a member.

### `GET /api/groups/:slug/members`

List group members. Requires phone-verified **group admin**. Never returns phone numbers.

**Response:** `{ group: { id, slug, name }, members: [{ id, role, joinedAt, user: { id, name, slug } }] }`

### `PATCH /api/groups/:slug/members`

Promote or demote a member. Requires phone-verified group admin.

**Body:** `{ "userId": "<cuid>", "role": "ADMIN" | "MEMBER" }`

**Rules:**
- Cannot demote the last remaining admin (400)
- 404 if member not found

**Response:** `{ ok: true, member }`

### `DELETE /api/groups/:slug/members`

Remove a member. Requires phone-verified group admin.

**Body:** `{ "userId": "<cuid>" }`

**Rules:**
- Cannot remove the last remaining admin (400)
- 404 if member not found

**Response:** `{ ok: true }`

## Suggestions

Community suggestion box. Equal visibility — no paid boosts. Phone verification required to submit or vote.

### `GET /api/suggestions`

List suggestions.

**Query:**
- `sort` — `new` (default) or `top` (by voteCount)
- `status` — `OPEN` | `PLANNED` | `DONE` | `CLOSED` (omit for all)

**Response:** `{ suggestions: [{ id, slug, title, body, status, voteCount, createdAt, viewerHasVoted, author: { id, name, slug } }] }`

### `POST /api/suggestions`

Create a suggestion. Requires verified phone.

**Body:** `{ "title": string (5–120), "body": string (10–5000) }`

**Response:** `{ id, slug, title, status, voteCount }`

### `GET /api/suggestions/:id`

Fetch one suggestion (includes `viewerHasVoted` when signed in).

### `POST /api/suggestions/:id/vote`

Toggle upvote (idempotent add/remove). Requires verified phone.

**Response:** `{ ok: true, voted: boolean, voteCount, id }`

### `PATCH /api/suggestions/:id`

Update status. Moderators only (`isModerator` / allowlist).

**Body:** `{ "status": "OPEN" | "PLANNED" | "DONE" | "CLOSED" }`

**Response:** `{ ok: true, suggestion: { id, status, title, voteCount } }`

