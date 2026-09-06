# TheLocal.nexus

A location-first community hub for real-world connection — find events, groups, and gatherings near you.

**Listings, not feeds.** Equal visibility. Trust through history.

## Quick start

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` with a demo phone (e.g. `5035550101` for Joe) — OTP shown in dev UI.

## Documentation

Full docs in [`docs/`](docs/README.md):

- [Product vision](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development guide](docs/DEVELOPMENT.md)
- [API reference](docs/API.md)
- [Demo personas](docs/DEMO-PERSONAS.md)

Agent instructions: [`AGENTS.md`](AGENTS.md)

## Stack

Next.js 16 · React 19 · TypeScript · Prisma 7 + SQLite · Tailwind v4 · Leaflet

## Docker demo server

```bash
docker compose up -d --build
```

Open port 3000. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for env vars, volumes, and ops.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run db:setup` | Migrate + seed |
| `npm run db:seed` | Re-seed demo data |
| `docker compose up -d --build` | Run demo in Docker |