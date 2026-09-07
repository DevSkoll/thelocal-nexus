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
2. **Seed** — runs only when:
   - `DEMO_SEED=true` (explicit wipe + reseed — destructive), **or**
   - the database has **no users** yet (first boot / empty volume)
3. **App** — Next.js standalone server on port 3000

On production/demo hosts (Thor + `docker-compose.prod.yml`), `DEMO_SEED` defaults to **`false`**. After first boot, crew-created listings and users persist across container rebuilds. Never run `docker compose down -v` on Thor unless you intentionally want to wipe `thelocal-data`.

## Environment variables

| Variable | Default (base) | Default (prod overlay) | Description |
|----------|----------------|------------------------|-------------|
| `APP_PORT` | `3000` | `3000` | Host port mapping |
| `DATABASE_URL` | `file:/data/dev.db` | same | SQLite path inside container |
| `DEMO_SEED` | `true` | **`false`** | Force wipe+reseed on start when `true`. When `false`, seed only if DB has no users |
| `DEV_GEO_*` | Fayetteville, NC | same | Fallback location when IP is private |
| `TWILIO_*` | (empty) | same | Mock SMS login when unset |

**Production / demo host (Thor):** keep `DEMO_SEED=false` after first boot (prod overlay default). Set `DEMO_SEED=true` only for an intentional full demo reset. Prefer a one-shot `docker compose run` / manual seed over leaving it `true` in `.env`.

## Demo / crew login

Crew test phones always use mock OTP (even when Twilio is configured). They never receive SMS; the API returns `devCode`.

| Persona | Phone |
|---------|-------|
| Maya Rivera | +15551001001 |
| Sam Okonkwo | +15551001002 |
| Harper Chen | +15551001003 |
| Avery Brooks | +15551001004 |

Pattern: `+15551001xxx` or env `TEST_OTP_PHONES`. See [DEMO-PERSONAS.md](DEMO-PERSONAS.md).

## Commands

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose logs -f          # Follow logs
docker compose down             # Stop (keeps thelocal-data volume)
docker compose down -v          # Stop and WIPE database volume — avoid on Thor
docker compose restart          # Restart (does not re-seed unless DEMO_SEED=true or DB empty)
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
- **Do not** wipe the `thelocal-data` volume on Thor rebuilds (`down -v` or deleting the volume destroys Mission/crew content).

## Image details

- Multi-stage build on `node:20-bookworm-slim`
- `better-sqlite3` compiled in image (native module)
- Standalone Next.js output for smaller runtime
- Data volume: `thelocal-data` → `/data/dev.db`

## Version 1.0 target host

Demo and pre-1.0 traffic stay on **THOR + NPM**. For Version 1.0, plan a **dedicated Linode** host (Postgres migration, TLS, backups). Do not treat the current SQLite Docker demo as the final production topology.
