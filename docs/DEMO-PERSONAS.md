# Demo Personas

Seeded by `prisma/seed.ts`. Reset with `npm run db:seed`.

Sign in at `/login` with phone OTP — no password required.

**Demo mode:** Twilio is not configured locally. After entering a demo phone, the OTP appears in the UI and server console.

## Demo phone numbers

| Persona | Phone | OTP |
|---------|-------|-----|
| Joe | +15035550101 | Shown in dev UI after send |
| Mira | +15035550102 | Shown in dev UI after send |
| Todd | +15035550103 | Shown in dev UI after send |
| Sam | +15035550104 | Shown in dev UI after send |

## Users

### Joe Martinez — +15035550101

- **Role:** Bike club admin, verified host
- **Tier:** VERIFIED_HOST
- **Location:** Portland, OR (15 mi radius)
- **Interests:** Cycling, Outdoors
- **Moderator:** yes (`isModerator` seeded; also allowlist via `MODERATOR_USER_IDS`)
- **Test as:** Group admin, host dashboard, park hangout poster, makers meetup host, **moderation queue** (`/moderation`)

### Mira Chen — +15035550102

- **Role:** Barn host for music nights, D&D, art workshops
- **Tier:** VERIFIED_HOST
- **Location:** Portland, OR (10 mi radius)
- **Interests:** Music, D&D, Arts
- **Test as:** RSVP approval flow (host), home-hosted events, paid workshop

### Todd Williams — +15035550103

- **Privacy demo:** `showRealName: false`, `showLocation: false`, `showJoinDate: false` (public profile shows username only)


- **Role:** Volunteer coordinator, pending RSVPs
- **Tier:** Phone verified, not Verified Host
- **Location:** Portland, OR (15 mi radius)
- **Interests:** Volunteering, Outdoors
- **Test as:** Pending barn RSVP (needs Mira approval), pending D&D RSVP, hiking buddy listing

### Sam Okonkwo — +15035550104

- **Role:** Hawthorne Roastery owner, business host
- **Tier:** VERIFIED_HOST
- **Location:** Hawthorne, Portland (10 mi radius)
- **Interests:** Music, Food
- **Test as:** Paid business listing (open mic), interested RSVP on bike ride

## Groups

| Slug | Name | Admin | Type |
|------|------|-------|------|
| `portland-urban-cyclists` | Portland Urban Cyclists | Joe | COMMUNITY |
| `riverfront-community-network` | Riverfront Community Network | Todd | ORGANIZATION |

## Listings (11)

| Slug | Title | Nature | Paid | Notable |
|------|-------|--------|------|---------|
| `saturday-morning-urban-ride` | Saturday Morning Urban Ride | Organization | No | Group recurring, 3 RSVPs |
| `barn-music-night-march` | Barn Music Night | Gathering | No | Home-hosted, approval required, Todd pending |
| `dnd-campaign-sunday` | Sunday D&D Campaign | Gathering | No | Home-hosted, Todd pending |
| `river-cleanup-volunteer` | Willamette River Cleanup | Organization | No | Todd announcement, 3 going |
| `laurelhurst-park-sunday-hangout` | Sunday Park Hangout | Gathering | No | No RSVP required |
| `join-portland-urban-cyclists` | Portland Urban Cyclists — Recruiting | Organization | No | GROUP_SEEKING type |
| `looking-for-hiking-buddy` | Looking for Hiking Buddy | Individual | No | LOOKING_FOR type |
| `watercolor-workshop-beginners` | Watercolor Workshop | Individual | **$10–$20** | Paid, home-hosted |
| `roastery-open-mic-night` | Open Mic at Hawthorne Roastery | Business | **$5–$8** | Sam's paid business event |
| `portland-neighborhood-festival` | Southeast Portland Festival | Large event | No | LARGE_EVENT nature tag |
| `makers-meetup-portland` | Portland Makers Monthly Meetup | Gathering | No | Tech interest |

## RSVP scenarios

| Listing | User | Status | Approved |
|---------|------|--------|----------|
| Barn Music Night | Todd | GOING | **Pending** — test host approval as Mira |
| Barn Music Night | Joe | GOING | Approved |
| D&D Campaign | Todd | GOING | **Pending** |
| Saturday Ride | Mira, Todd | GOING | Approved |
| Saturday Ride | Sam | INTERESTED | — |
| River Cleanup | Joe, Mira, Sam | GOING | Approved |
| Watercolor Workshop | Joe | GOING | Approved |

## Messages & announcements

- **Barn Music Night:** Todd asks about parking; Mira replies. Mira posted snack announcement.
- **Saturday Ride:** Sam asks about pace; Joe replies.
- **River Cleanup:** Todd posted weather/meeting announcement.

## Suggested test flows

1. **RSVP approval:** Login as Mira → `/host` → approve Todd's barn RSVP
2. **Paid listing:** View `/listings/roastery-open-mic-night` — PAID EVENT badge visible
3. **Group join:** Login as Sam → `/groups/portland-urban-cyclists` → join
4. **Messages:** View barn listing → see listing-scoped thread
5. **Create listing:** Login as Joe → `/post` → set nature tag + interests
6. **Moderation:** Login as Joe → `/moderation` → review seeded reports (dismiss / action / cancel listing)