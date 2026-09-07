# Contributing to TheLocal.nexus

The community is the product. Contributions should help neighbors meet in real life — not add feeds, vanity metrics, or pay-to-be-seen.

Public repo: [github.com/DevSkoll/thelocal-nexus](https://github.com/DevSkoll/thelocal-nexus)

## Before you write code

1. Read [docs/PRODUCT.md](docs/PRODUCT.md) (what we build / do not build).
2. Skim [AGENTS.md](AGENTS.md) for stack, paths, and coding rules.
3. Open an issue for anything larger than a small bugfix so we can agree on shape.

## Local setup

```bash
git clone https://github.com/DevSkoll/thelocal-nexus.git
cd thelocal-nexus
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo phones are in [docs/DEMO-PERSONAS.md](docs/DEMO-PERSONAS.md). Crew test numbers (`+15551001xxx`) always use mock OTP.

Never commit `.env`, SQLite files, or `data/uploads`. Those are gitignored on purpose.

## Checks we run in CI

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run ci` runs all three. Please run them before opening a PR.

## Pull requests

- One concern per PR. Match existing patterns; no drive-by refactors.
- API routes: Zod validation; `requirePhoneVerified()` for listings/messages.
- Every listing surface should show **ListingTags** (paid + nature, plus interests).
- After schema changes: migrate, update seed if needed, confirm `npm run build`.
- Do not add markdown files unless the change needs them.

Use the PR template. Maintainers squash-merge to `main`.

When the change is user-visible, add a bullet under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md). If you finish an item in [TODO.md](TODO.md), check it off in the same PR.

## Product lines we will not merge

- Algorithmic / “for you” feeds
- Pay-to-boost or promoted listings
- Follower graphs or vanity metrics (likes, view counts)
- Global DMs (messages stay listing-scoped)
- Surveillance advertising

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
