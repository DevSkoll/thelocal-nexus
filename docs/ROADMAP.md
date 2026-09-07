# Roadmap

Current state: MVP demo with seeded data, demo auth, and core listing/discovery flows.

Open work for contributors is the checklist in [`TODO.md`](../TODO.md). Shipped history is [`CHANGELOG.md`](../CHANGELOG.md).

## Shipped (MVP)

- [x] Listing creation with type, nature tag, paid pricing
- [x] Discovery (list + map) with location, interest, nature, paid filters
- [x] Listing detail with tags, RSVP, messages
- [x] Groups with join
- [x] Host dashboard with RSVP approval
- [x] Host announcements
- [x] User settings (location, radius, interests)
- [x] Interest alerts
- [x] Listing reports
- [x] Safety page
- [x] Phone-first OTP auth (Twilio + mock fallback)
- [x] AI-built product story (About page + footer note)
- [x] Rich seed data (11 listings, RSVPs, messages)

## Near-term

- [ ] Email OTP as secondary verification
- [ ] SMS notifications for alerts and RSVP updates
- [x] Reputation points and automatic Verified Host promotion
- [x] Listing edit and cancel (host)
- [x] Group creation flow
- [x] Admin moderation queue for reports
- [x] Suggestion box with community voting (equal visibility, phone-verified)
- [ ] Postgres migration path (replace SQLite for production)

## Medium-term

- [ ] Recurring event calendar view
- [ ] Waitlist management when at capacity
- [x] Group admin tools (member management, group listings)
- [x] User profile pages (host history, not follower counts)
- [x] Skills advertising (SkillOffer discovery + owner APIs)
- [x] Skill create UI form
- [x] Peer vouch flow on public profiles
- [x] Profile privacy + customization (links, cover/avatar, toggles)
- [x] EVENT_HOSTED / EVENT_COMPLETED on listing completion
- [ ] Image uploads for listings and groups
- [ ] Geocoding integration for location input

## Version 1.0 hosting

- **Until 1.0:** keep running on THOR + NPM as today.
- **At / post 1.0:** move to a **dedicated Linode host** (infra work tracked separately — not in this foundation PR).

## Explicitly not planned

These conflict with product principles (see [PRODUCT.md](PRODUCT.md)):

- Algorithmic feeds or "for you" recommendations
- Pay-to-boost or promoted listings
- Follower/following social graphs
- Global direct messages
- Vanity metrics (likes, view counts)
- Surveillance advertising

## Known gaps (MVP)

| Area | Gap |
|------|-----|
| Auth | Phone OTP only; no email/password login yet |
| Notifications | Alerts stored but not delivered |
| Moderation | Queue shipped; expand tools (appeals, audit log) later |
| Images | No upload; text-only listings |
| Mobile | Responsive web only; no native app |
| Search | Basic text match; no fuzzy/geo autocomplete |
| Payments | Price display only; no checkout integration |