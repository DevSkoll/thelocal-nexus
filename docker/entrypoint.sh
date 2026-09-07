#!/bin/sh
set -e

mkdir -p /data /data/uploads/avatars /data/uploads/covers
export DATABASE_URL="${DATABASE_URL:-file:/data/dev.db}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

echo "==> TheLocal.nexus starting"
echo "    DATABASE_URL=$DATABASE_URL"
echo "    DEMO_SEED=${DEMO_SEED:-unset}"

echo "==> Running database migrations..."
npx prisma migrate deploy

# Seed only when DEMO_SEED=true (explicit wipe + reseed). Empty DB stays empty.
if [ "$DEMO_SEED" = "true" ]; then
  echo "==> DEMO_SEED=true — seeding demo data (destructive wipe + demo data)"
  echo "==> Seeding demo data..."
  npx tsx prisma/seed.ts
else
  echo "==> DEMO_SEED=${DEMO_SEED:-false} — skipping seed (empty DB stays empty until real users)"
fi

echo "==> Starting Next.js on ${HOSTNAME}:${PORT}"
exec node server.js
