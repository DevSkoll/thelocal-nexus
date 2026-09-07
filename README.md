# TheLocal.nexus

[![CI](https://github.com/DevSkoll/thelocal-nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/DevSkoll/thelocal-nexus/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-002868.svg)](LICENSE)

Location-first community hub for real-world connection. **Listings, not feeds.** Equal visibility. Trust through history.

**Live product:** [thelocal.nexus](https://thelocal.nexus) · **Source:** [github.com/DevSkoll/thelocal-nexus](https://github.com/DevSkoll/thelocal-nexus)

The community is the product, not the individual. Success is people meeting in real life — not screen time.

## Quick start

```bash
git clone https://github.com/DevSkoll/thelocal-nexus.git
cd thelocal-nexus
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` with a [demo persona](docs/DEMO-PERSONAS.md) (crew phones `+15551001xxx` always use mock OTP).

## What we build (and don't)

**Build:** local listings, map + list discovery, groups, RSVP, listing-scoped messages, trust through history.

**Do not build:** algorithmic feeds, pay-to-be-seen, follower counts, global DMs, surveillance ads, vanity metrics.

Full north star: [docs/PRODUCT.md](docs/PRODUCT.md).

## Stack

Next.js 16 · React 19 · TypeScript · Prisma 7 + SQLite · Tailwind v4 · Leaflet · Zod

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build |
| `npm run ci` | lint + typecheck + build (what GitHub Actions runs) |
| `npm run db:setup` | Migrate + seed |
| `npm run db:seed` | Re-seed demo data only |
| `docker compose up -d --build` | Demo container |

## Secrets and data (keep them out of git)

These are gitignored. Do not commit them, attach them to issues, or paste them into PRs:

- `.env` (copy from `.env.example`)
- SQLite files (`prisma/*.db`, `*.db`)
- Uploaded avatars/covers (`data/uploads`, `public/uploads`)

Demo seed data uses fictional personas and reserved test phone numbers only.

## Documentation

| Doc | Contents |
|-----|----------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to send a change |
| [CHANGELOG.md](CHANGELOG.md) | What shipped |
| [TODO.md](TODO.md) | Open work |
| [docs/PRODUCT.md](docs/PRODUCT.md) | Vision and principles |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local workflow |
| [docs/API.md](docs/API.md) | HTTP routes |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker demo |
| [docs/README.md](docs/README.md) | Full index |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents |
| [SECURITY.md](SECURITY.md) | Vulnerability reports |

## Docker demo

```bash
cp .env.example .env   # set ALTCHA_HMAC_KEY for any shared host
docker compose up -d --build
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Production/demo hosts should keep `DEMO_SEED=false` so the data volume is never wiped on rebuild.

## License

[MIT](LICENSE) · [Code of Conduct](CODE_OF_CONDUCT.md)
