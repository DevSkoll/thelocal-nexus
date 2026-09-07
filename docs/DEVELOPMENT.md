# Development Guide

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
git clone <repo>
cd communityhub
npm install          # runs prisma generate via postinstall
npm run db:setup     # migrate + seed
npm run dev          # http://localhost:3000
```

## Environment

Default database URL is `file:./prisma/dev.db`. Copy the template and edit locally — **never commit `.env`**:

```
cp .env.example .env
```

```
DATABASE_URL="file:./prisma/dev.db"
# Optional locally — insecure in-code fallback is used when unset (dev only).
# ALTCHA_HMAC_KEY="$(openssl rand -hex 32)"
# Optional narrow crew bypass (default off):
# ALTCHA_BYPASS_TEST_PHONES=true
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ci` | lint + typecheck + build |
| `npm run db:setup` | Migrate + seed |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Re-seed demo data |

## Workflow

1. Create a feature branch
2. Make focused changes matching existing patterns
3. Run `npm run build` before committing
4. If schema changed: migrate → update seed → seed → build

## Moderation (demo)

Moderators see **Moderation** in the header and can open `/moderation`.

Access is granted when:

1. `User.isModerator` is true (Joe is seeded this way), **or**
2. The user id or slug is listed in `MODERATOR_USER_IDS` (comma-separated), e.g. `MODERATOR_USER_IDS=joe-martinez`.

APIs never return phone numbers in the queue — display name + slug only. See [API.md](API.md) Reports section.

## ALTCHA on login

`/login` embeds the ALTCHA widget (`auto="onload"` so PoW auto-solves in normal browsers). `POST /api/auth/phone/send` requires a valid `altcha` payload (400 if missing/invalid) before `sendOtp`.

- Prefer **no bypass** for crew phones — automation should wait for the widget.
- If crew login is blocked in a constrained environment, set `ALTCHA_BYPASS_TEST_PHONES=true` (default off; only skips ALTCHA for `isTestOtpPhone` numbers).
- Challenge route: `GET /api/auth/altcha/challenge`.
## OTP send rate limits

Implemented in `src/lib/otp-rate-limit.ts` on `POST /api/auth/phone/send` (after normalize + ALTCHA, before `sendOtp`):

- Per phone: **1** / 60s and **5** / rolling hour
- Per IP: **10** / rolling hour (`x-forwarded-for` first hop via `getClientIp`)
- Exceeded → `429` `{ error, retryAfterSeconds }` (generic; does not leak phone existence)
- In-memory / single-node OK for Thor; shared store needed if you run multiple app instances

## Demo / crew login (mock OTP)

Visit `/login` and use a **crew test phone** — mock OTP always, even when Twilio is configured:

| Persona | Phone |
|---------|-------|
| Maya Rivera | +15551001001 |
| Sam Okonkwo | +15551001002 |
| Harper Chen | +15551001003 |
| Avery Brooks | +15551001004 |

Pattern: `+15551001xxx` (or env `TEST_OTP_PHONES`). These numbers **never receive SMS**; the send API returns `devCode` for bots. See [DEMO-PERSONAS.md](DEMO-PERSONAS.md).

Legacy Portland seed phones (`+1503555010x`) only get mock OTP when Twilio env vars are unset.

Configure Twilio for real SMS via `.env` / compose (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`). Do not commit secrets.

## Code conventions

- Import Prisma from `@/generated/prisma/client`
- API routes: Zod validation + `getCurrentUser()` for auth
- Server components by default
- Use existing semantic colors and badge variants
- Show `ListingTags` on every listing card and detail page

## Agent assistance

- [`AGENTS.md`](../AGENTS.md) — instructions for AI coding agents
- [`.grok/skills/communityhub-dev/`](../.grok/skills/communityhub-dev/SKILL.md) — dev workflow skill
- [`.grok/skills/communityhub-seed/`](../.grok/skills/communityhub-seed/SKILL.md) — database skill

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Prisma client not found | `npm run db:generate` |
| Empty pages / no listings | `npm run db:seed` |
| Build TypeScript errors after schema change | `npm run db:generate` then rebuild |
| Port 3000 in use | Kill existing process or use `next dev -p 3001` |
