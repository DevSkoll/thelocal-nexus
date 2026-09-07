# Deployment — Docker Demo

Run TheLocal.nexus on a demo server with Docker Compose. SQLite data persists in a Docker volume.

## Requirements

- Docker 24+ and Docker Compose v2
- Port 3000 (or set `APP_PORT`)

## Quick start

```bash
# From project root
cp docker/.env.demo .env   # optional — defaults work
docker compose up -d --build
```

Open `http://<server-ip>:3000`

## What happens on start

1. **Migrations** — `prisma migrate deploy` applies schema
2. **Seed** — when `DEMO_SEED=true` (default), demo data is loaded (Portland + Fayetteville listings, 4 personas)
3. **App** — Next.js standalone server on port 3000

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3000` | Host port mapping |
| `DATABASE_URL` | `file:/data/dev.db` | SQLite path inside container |
| `DEMO_SEED` | `true` | Re-seed demo data on each container start |
| `DEV_GEO_*` | Fayetteville, NC | Fallback location when IP is private |
| `TWILIO_*` | (empty) | Mock SMS login when unset |

Set `DEMO_SEED=false` after first deploy to preserve volume data between restarts.

## Demo login

Phone OTP uses mock SMS when Twilio is not configured. Demo phones:

| Persona | Phone |
|---------|-------|
| Joe | +15035550101 |
| Mira | +15035550102 |
| Todd | +15035550103 |
| Sam | +15035550104 |

OTP appears in the login UI and container logs.

## Commands

```bash
docker compose up -d --build    # Build and start
docker compose logs -f          # Follow logs
docker compose down             # Stop
docker compose down -v          # Stop and wipe database volume
docker compose restart          # Restart (re-seeds if DEMO_SEED=true)
```

## Profile uploads

Avatar and cover images are stored on disk (no S3 yet):

- **Local/dev:** `data/uploads/{avatars,covers}` (gitignored; override with `UPLOAD_ROOT`)
- **Docker:** `/data/uploads/{avatars,covers}` when `/data` exists (same volume as SQLite)

Public URLs are `/uploads/...` and are served by `src/app/uploads/[...path]/route.ts`.

For production, ensure the `/data` volume (or set `UPLOAD_ROOT`) persists across container rebuilds. Without a volume, uploads are lost on recreate.

## Production notes

- SQLite suits demo/single-node only. For multi-instance production, migrate to Postgres.
- Put a reverse proxy (Caddy, nginx, Traefik) in front for HTTPS.
- Trust `X-Forwarded-For` from your proxy so IP geolocation works for visitors.

## Image details

- Multi-stage build on `node:20-bookworm-slim`
- `better-sqlite3` compiled in image (native module)
- Standalone Next.js output for smaller runtime
- Data volume: `thelocal-data` → `/data/dev.db`

## Version 1.0 target host

Demo and pre-1.0 traffic stay on **THOR + NPM**. For Version 1.0, plan a **dedicated Linode** host (Postgres migration, TLS, backups). Do not treat the current SQLite Docker demo as the final production topology.
