# Demo Personas

Seeded by `prisma/seed.ts`. Reset with `npm run db:seed`.

Sign in at `/login` with phone OTP — no password required.

**Mock OTP:** Crew phones (`+15551001xxx`) always get mock OTP + `devCode` (even with Twilio). Legacy Portland phones only when Twilio is unset.

## Demo phone numbers

**Crew test OTP phones** (`+15551001xxx`) always use mock OTP — even when Twilio is configured on the live demo. These numbers **never receive SMS**. The API returns `devCode` so bots and humans can complete login. Optional override list: env `TEST_OTP_PHONES` (comma-separated E.164).

| Persona | Phone | OTP |
|---------|-------|-----|
| Maya Rivera | +15551001001 | `devCode` in API / login UI |
| Sam Okonkwo | +15551001002 | `devCode` in API / login UI |
| Harper Chen | +15551001003 | `devCode` in API / login UI |
| Avery Brooks | +15551001004 | `devCode` in API / login UI |

**Legacy Portland seed phones** (mock only when Twilio is unset):

| Persona | Phone | OTP |
|---------|-------|-----|
| Joe | +15035550101 | Shown when global mock SMS |
| Mira | +15035550102 | Shown when global mock SMS |
| Todd | +15035550103 | Shown when global mock SMS |

## Users

### Maya Rivera — +15551001001

- **Role:** Meetup host
- **Slug:** `maya-rivera`
- **Tier:** VERIFIED_HOST
- **Location:** Fayetteville, NC
- **Privacy:** open profile (name, location, skills, reputation, join date)
- **Listing:** Neighbors Coffee Meetup (`maya-neighbors-coffee-meetup`) — ONE_TIME_EVENT / GATHERING
- **Test as:** Host dashboard, crew mock OTP login

### Sam Okonkwo — +15551001002

- **Role:** Skilled labor (handyman / yard)
- **Slug:** `sam-okonkwo`
- **Tier:** VERIFIED_HOST
- **Location:** Fayetteville, NC
- **Interests:** Tech, Outdoors, Volunteering
- **Skill offer:** Handyman & yard help
- **Listings:** Basic Home Repair Workshop; Hay Street open mic
- **Test as:** Skill offer, paid workshop, crew mock OTP

### Harper Chen — +15551001003

- **Role:** Looking for help / new in town
- **Slug:** `harper-chen`
- **Tier:** Phone verified, UNVERIFIED host tier
- **Location:** Fayetteville, NC
- **Privacy:** `showRealName: false`, `showSkills: false`, `showReputation: false`, `showJoinDate: false`
- **Listing:** Looking for Help Moving a Couch (`harper-looking-for-moving-help`) — LOOKING_FOR
- **Test as:** Help-seeker flow, quieter public profile

### Avery Brooks — +15551001004

- **Role:** Outdoor activities / volunteer trail days
- **Slug:** `avery-brooks`
- **Tier:** VERIFIED_HOST
- **Location:** Fayetteville, NC (location hidden on public profile)
- **Privacy:** `showLocation: false`
- **Listing:** Sunday Trail Tidy & Short Walk (`avery-sunday-trail-tidy`) — VOLUNTEER / recurring
- **Test as:** Recurring volunteer activity host

### Joe Martinez — +15035550101 (legacy seed)

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

## Groups

| Slug | Name | Admin | Type |
|------|------|-------|------|
| `portland-urban-cyclists` | Portland Urban Cyclists | Joe | COMMUNITY |
| `riverfront-community-network` | Riverfront Community Network | Todd | ORGANIZATION |

## Listings (selected)

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
| `basic-home-repair-workshop` | Basic Home Repair Workshop | Individual | **$15–$25** | Sam workshop |
| `maya-neighbors-coffee-meetup` | Neighbors Coffee Meetup | Gathering | No | Maya crew |
| `harper-looking-for-moving-help` | Looking for Help Moving a Couch | Individual | No | Harper LOOKING_FOR |
| `avery-sunday-trail-tidy` | Sunday Trail Tidy & Short Walk | Gathering | No | Avery volunteer |
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
2. **Paid listing:** View `/listings/basic-home-repair-workshop` — PAID EVENT badge visible
3. **Group join:** Login as Sam → `/groups/portland-urban-cyclists` → join
4. **Messages:** View barn listing → see listing-scoped thread
5. **Create listing:** Login as Joe → `/post` → set nature tag + interests
6. **Moderation:** Login as Joe → `/moderation` → review seeded reports (dismiss / action / cancel listing)