# Product Vision

## What is TheLocal.nexus?

A location-first community hub that helps people find and join real-world gatherings near them — bike rides, barn music nights, volunteer cleanups, open mics, and neighborhood festivals.

**Domain:** thelocal.nexus  
**Tagline:** What's happening near you

## North star

The **community is the product**, not the individual. Success is measured by people meeting in real life, not by screen time or engagement metrics.

## Core principles

### Listings, not feeds

Every piece of content is a **listing** — a discrete, locatable invitation with a clear purpose. There is no infinite scroll feed, no algorithm deciding what you see, and no pay-to-be-seen promotion.

### Equal visibility

All active listings within a user's radius get equal treatment. Discovery is filtered by location, interests, and explicit user choices — not by engagement scores or ad spend.

### Trust through history

Verification tiers and host track records build trust over time. We do not use follower counts, vanity metrics, or popularity rankings.

### Listing-scoped communication

Messages and announcements belong to a specific listing. There are no global direct messages — conversation stays tied to real-world context.

## What we build

- Local discovery (map + list views)
- Listing creation with rich metadata (type, nature tag, paid pricing)
- Groups (communities, organizations, businesses)
- RSVP with optional host approval
- Interest-based alerts
- Host dashboard (approvals, announcements)
- Safety reporting

## What we do not build

- Algorithmic feeds or "for you" recommendations
- Pay-to-boost or promoted listings
- Follower/following social graphs
- Global DMs or chat rooms
- Surveillance advertising or data brokerage
- Vanity metrics (likes, view counts, streaks)

## Listing tags

Every listing carries upfront metadata:

- **Paid event** — prominent badge with price range when `isPaid`
- **Nature tag** — single classification: Individual, Gathering, Business, Organization, or Large event
- **Type** — one-time event, recurring, volunteer, hangout spot, etc.
- **Interests** — category tags for filtering and alerts

## Privacy-first identity

The only required real-world identifier is a **working cellphone number**.

| Use | Phone | Email |
|-----|-------|-------|
| Account creation | Primary | Optional secondary |
| Verification / human proof | OTP via SMS | Future optional |
| Account recovery | Same OTP flow | — |
| Notifications | SMS (future) | Optional |
| Create listings, post comments | Required verified phone | — |

**Verified Host** is separate from phone verification — earned through community vouches, real hosted events, and reputation. Not purchasable.

We collect minimal data. Phone numbers are never shown publicly (masked in UI).

## Brand

Visual design uses an American-proud palette (navy, red, white). Copy is community-focused — colors express pride, words express connection. No patriotic slogans in text.