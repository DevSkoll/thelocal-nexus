# Changelog

All notable changes to TheLocal.nexus are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-09-07

First public source drop. MVP demo: listings, discovery, groups, phone OTP, and trust tools.

### Added

- Listing create/detail with type, nature tag, paid pricing, RSVP, and listing-scoped messages
- Discovery (list + map) with location, interest, nature, paid, and intent chips (Do / Volunteer / Help / Offer)
- Volunteer listings stay unpaid on the post path; skill offers live on Offer
- Groups: join, create, and admin member tools
- Host dashboard: RSVP approval, announcements, edit, cancel, mark completed
- Phone-first OTP auth (Twilio or mock), ALTCHA proof-of-work, and in-memory OTP send rate limits
- Profiles with privacy toggles, links, avatar/cover uploads, peer vouches
- Skills advertising (discovery + create UI)
- Reputation ledger, Verified Host promotion, listing-completion awards
- Suggestion box with equal-visibility voting
- Admin moderation queue for listing reports
- Public GitHub project: MIT license, CI, issue/PR templates, Dependabot, contributing and security docs
- Footer and About links to [github.com/DevSkoll/thelocal-nexus](https://github.com/DevSkoll/thelocal-nexus)
- [CHANGELOG.md](CHANGELOG.md) and [TODO.md](TODO.md) for release history and open work

### Changed

- Recurrence on post/edit is a Daily / Weekly / Monthly / Other picker instead of a raw rule string
- Listing cards and detail show every selected interest tag, not only the nature badge
- Demo seed runs only when `DEMO_SEED=true` so production volumes are not wiped on rebuild

### Fixed

- Header still showed signed-out after OTP until a manual refresh
- Ideas (and Groups) navy heroes rendered white-on-white because `.brand-hero` overrode the fill
- Footer “Built with” row used excess horizontal space
- Mark completed was a silent no-op for future-dated listings
- Skill prices, home-service tags, geo defaults, and settings save UX

### Security

- ALTCHA on `POST /api/auth/phone/send`
- Per-phone and per-IP OTP send rate limits
- `.env`, SQLite, and uploads stay gitignored; only `.env.example` is committed

[Unreleased]: https://github.com/DevSkoll/thelocal-nexus/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/DevSkoll/thelocal-nexus/releases/tag/v0.1.0
