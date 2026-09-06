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

Default database URL is `file:./prisma/dev.db`. Override with `.env`:

```
DATABASE_URL="file:./prisma/dev.db"
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:setup` | Migrate + seed |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Re-seed demo data |

## Workflow

1. Create a feature branch
2. Make focused changes matching existing patterns
3. Run `npm run build` before committing
4. If schema changed: migrate → update seed → seed → build

## Demo login

Visit `/login`, enter a demo phone (e.g. `+15035550101` for Joe), and use the OTP shown in the UI (mock SMS — no Twilio needed). See [DEMO-PERSONAS.md](DEMO-PERSONAS.md).

Configure Twilio for production SMS via `.env.example` variables.

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