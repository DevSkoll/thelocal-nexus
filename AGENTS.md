# TheLocal.nexus — Agent Instructions

You are working on **TheLocal.nexus** (`thelocal-nexus`), a location-first community hub for real-world connection. Read this file before making changes. Public source: `https://github.com/DevSkoll/thelocal-nexus`.

## Product north star

The **community is the product**, not the individual. Success = people meeting in real life, not screen time.

**Do build:** listings (not feeds), local discovery, groups, RSVP, trust signals, listing-scoped messaging.  
**Do not build:** algorithmic feeds, pay-to-be-seen, vanity metrics, follower counts, surveillance ads.

## Brand

| Layer | Guidance |
|-------|----------|
| **Visual** | American-proud palette: navy (`sage` #002868), red (`terracotta` #BF0A30), white. `brand-bar`, `brand-hero` in `globals.css`. |
| **Copy** | Community-focused. Never use patriotic slogans in text ("Made in America", "red white blue", etc.). |
| **Name** | `APP_NAME` = "TheLocal", domain `thelocal.nexus` |

## Stack

- **Next.js 16** App Router, React 19, TypeScript
- **Prisma 7** + SQLite (`better-sqlite3` adapter) — see `src/lib/db.ts`
- **Tailwind CSS v4** — tokens in `src/app/globals.css`
- **Leaflet** for map view (client-only, dynamic import)
- **Zod** for API validation

## Commands

```bash
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run db:setup     # migrate + seed (first time / after schema change)
npm run db:seed      # re-seed demo data only
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate → src/generated/prisma
docker compose up -d --build   # demo server (see docs/DEPLOYMENT.md)
```

## Key paths

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Data model |
| `prisma/seed.ts` | Demo personas (Joe, Mira, Todd, Sam) |
| `src/lib/constants.ts` | Taxonomies: listing types, interests, nature tags |
| `src/lib/listings.ts` | Discovery queries + filters |
| `src/lib/host.ts` | Host authorization + dashboard data |
| `src/lib/auth.ts` | Cookie session (`thelocal_user_id`) — demo auth |
| `src/components/listings/` | Cards, map, post form, tags, RSVP |
| `docs/` | Human + agent reference documentation |
| `.grok/references/` | Quick lookup for routes, schema, file map |

## Data model (summary)

- **Listing** — atomic unit; has `type`, `natureTag`, `isPaid`/`priceMin`/`priceMax`, interests, RSVPs
- **Nature tags** (single): INDIVIDUAL, GATHERING, BUSINESS, ORGANIZATION, LARGE_EVENT
- **Group** — community/org page; members, listings
- **User** — verification tier, location radius, interests, alerts
- **Message** — scoped to listing (not global DMs)
- **Report** — listing reports for moderation

Import Prisma client from `@/generated/prisma/client` (not `@/generated/prisma`).

## Auth (privacy-first)

Phone OTP is the primary identity. Cookie session: `thelocal_user_id`.

- `/login` → phone → OTP → session (Twilio Verify when configured; mock SMS in dev)
- `phoneVerifiedAt` required to create listings, post comments, RSVP to home-hosted events
- Email optional secondary (`emailVerifiedAt`)
- `VERIFIED_HOST` is earned trust (vouches, event history) — separate from phone verification

Demo phones: Joe +15035550101, Mira +15035550102, Todd +15035550103, Sam +15035550104

## UI conventions

- Use existing semantic colors: `terracotta` (red/CTA), `sage` (navy), `ink`, `cream`, `stone`
- Badge variants: `paid`, `nature`, `type`, `interest`, `verified`
- Fonts: Libre Franklin (sans), Merriweather (serif)
- Mobile-first; server components by default; `"use client"` only for interactivity

## Coding rules

1. Match existing patterns — don't refactor unrelated code.
2. Every listing shows **ListingTags** upfront (paid + nature) on cards and detail.
3. API routes: validate with Zod; use `requirePhoneVerified()` for listings/messages; `getCurrentUser()` for other auth.
4. After schema changes: migrate, generate, update seed, verify build.
5. Do not add markdown files the user didn't ask for — except this project docs set.

## Demo personas (seed)

- **Joe** — bike club admin, verified host
- **Mira** — barn host, RSVP approval flow
- **Todd** — volunteer coordinator, pending barn RSVP
- **Sam** — Hawthorne Roastery, paid business open mic

## Next.js note

<!-- BEGIN:nextjs-agent-rules -->
This is NOT the Next.js you know. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.
<!-- END:nextjs-agent-rules -->

## More detail

- `docs/ARCHITECTURE.md` — system design
- `docs/API.md` — route reference
- `docs/DEVELOPMENT.md` — local workflow
- `.grok/references/` — agent quick refs