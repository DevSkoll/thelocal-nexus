# Roadmap

Current state: MVP demo with seeded data, demo auth, and core listing/discovery flows.

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
- [x] Rich seed data (11 listings, RSVPs, messages)

## Near-term

- [ ] Email OTP as secondary verification
- [ ] SMS notifications for alerts and RSVP updates
- [ ] Reputation points and automatic Verified Host promotion
- [ ] Listing edit and cancel (host)
- [ ] Group creation flow
- [ ] Admin moderation queue for reports
- [ ] Postgres migration path (replace SQLite for production)

## Medium-term

- [ ] Recurring event calendar view
- [ ] Waitlist management when at capacity
- [ ] Group admin tools (member management, group listings)
- [ ] User profile pages (host history, not follower counts)
- [ ] Image uploads for listings and groups
- [ ] Geocoding integration for location input

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
| Moderation | Reports stored but no admin UI |
| Images | No upload; text-only listings |
| Mobile | Responsive web only; no native app |
| Search | Basic text match; no fuzzy/geo autocomplete |
| Payments | Price display only; no checkout integration |