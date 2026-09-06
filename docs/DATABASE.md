# Database

## Overview

SQLite database managed by Prisma 7. Local file: `prisma/dev.db`.

Prisma 7 requires the `@prisma/adapter-better-sqlite3` adapter — configured in `src/lib/db.ts` and `prisma/seed.ts`.

## Schema location

`prisma/schema.prisma` — full model definitions.

Quick reference: [`.grok/references/schema-reference.md`](../.grok/references/schema-reference.md)

## Models

| Model | Purpose |
|-------|---------|
| User | Phone (primary), optional email, location, host trust tier, interests |
| PhoneOtpChallenge | Mock SMS OTP storage (dev only) |
| Interest | Shared taxonomy (cycling, music, etc.) |
| Listing | Events, hangouts, volunteer ops — the atomic unit |
| Group | Community/org pages |
| GroupMember | User ↔ Group with role (MEMBER, ADMIN) |
| Rsvp | Per-listing attendance with approval flag |
| Message | Listing-scoped public thread |
| Announcement | Host updates on a listing |
| Report | User moderation reports (status, reviewer, resolution) |
| Alert | Interest + radius notification preference |
| SkillOffer | Neighbor skill advertising (sibling to Listing) |
| ReputationEvent | Append-only trust ledger |
| Feedback | Two-sided ratings tied to listing/skill context |

## Key enums

- **ListingType:** ONE_TIME_EVENT, RECURRING_EVENT, GROUP_SEEKING, HANGOUT_SPOT, VOLUNTEER, WORKSHOP, LOOKING_FOR
- **ListingNatureTag:** INDIVIDUAL, GATHERING, BUSINESS, ORGANIZATION, LARGE_EVENT
- **VerificationTier:** UNVERIFIED, VERIFIED_HOST (host trust only)
- **phoneVerifiedAt / emailVerifiedAt:** account verification timestamps
- **RsvpStatus:** INTERESTED, GOING, WAITLIST
- **ReportStatus:** OPEN, REVIEWING, ACTIONED, DISMISSED
- **User.isModerator:** demo/admin flag (Joe seeded true); also `MODERATOR_USER_IDS` env

## Migrations

```bash
npm run db:migrate
```

Migrations live in `prisma/migrations/`. Prisma config in `prisma.config.ts`.

## Seed

```bash
npm run db:seed
```

`prisma/seed.ts` deletes all data and recreates demo content:

- 4 users (Joe, Mira, Todd, Sam)
- 10 interests
- 2 groups
- 11 listings with varied types, nature tags, and paid status
- RSVPs, messages, announcements, alerts

See [DEMO-PERSONAS.md](DEMO-PERSONAS.md) for details.

## Prisma client import

```ts
import { PrismaClient } from "@/generated/prisma/client";
import type { ListingType } from "@/generated/prisma/client";
```

Output path is configured in `schema.prisma`:

```
output = "../src/generated/prisma"
```

## Reset database

```bash
rm prisma/dev.db
npm run db:setup
```