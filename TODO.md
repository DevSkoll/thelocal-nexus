# TODO

Working list for TheLocal.nexus. Product principles and “will not build” live in [docs/PRODUCT.md](docs/PRODUCT.md). Phased narrative lives in [docs/ROADMAP.md](docs/ROADMAP.md).

Pick from **Now** or **Next**. Check an item here when it ships, and add a line under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md).

## Now (1.0 hardening)

- [ ] Replace demo sessions (`thelocal_user_id` = public user id) with an opaque signed cookie; set `Secure` in production
- [ ] Stop serializing phone/email on Discover, host tools, and RSVP payloads; honor `showRealName` on cards and attendee lists
- [ ] Never return `devCode` when `NODE_ENV=production`; refuse `prisma/seed.ts` unless `DEMO_SEED=true`
- [ ] Enforce volunteer listings unpaid on create and PATCH (UI already forces free)
- [ ] RSVP and messages only on `ACTIVE` listings; honor capacity (WAITLIST enum exists, unused)
- [ ] Deliver stored interest alerts (SMS) or label them in-app only
- [ ] Postgres migration path (SQLite stays for local/demo)

## Next

- [ ] Email OTP as secondary verification
- [ ] Recurring event calendar view (rules already persist)
- [ ] Waitlist when a listing is at capacity
- [ ] Image uploads for listings and groups (avatars/covers already exist)
- [ ] Geocoding for location input beyond zip
- [ ] Expand moderation: appeals and an audit log
- [ ] Case-insensitive / fuzzier search

## Later

- [ ] Price checkout (today: display only)
- [ ] Native apps (responsive web is the client)
- [ ] Dedicated 1.0 host (Linode); until then THOR + NPM — see [docs/ROADMAP.md](docs/ROADMAP.md)

## Docs / repo hygiene

- [ ] Keep [docs/API.md](docs/API.md) in sync with complete-listing and settings PATCH shapes
- [ ] Keep [AGENTS.md](AGENTS.md) demo phones aligned with crew `+15551001xxx` in [docs/DEMO-PERSONAS.md](docs/DEMO-PERSONAS.md)

## Not doing

These conflict with the product line. Do not add them here as work:

- Algorithmic feeds or “for you”
- Pay-to-boost
- Follower graphs
- Global DMs
- Vanity metrics (likes, view counts)
- Surveillance advertising
