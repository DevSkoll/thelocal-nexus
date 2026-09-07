#!/bin/sh
set -e

mkdir -p /data /data/uploads/avatars /data/uploads/covers
export DATABASE_URL="${DATABASE_URL:-file:/data/dev.db}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

echo "==> TheLocal.nexus starting"
echo "    DATABASE_URL=$DATABASE_URL"

echo "==> Running database migrations..."
npx prisma migrate deploy

if [ "$DEMO_SEED" = "true" ]; then
  echo "==> Seeding demo data..."
  npx tsx prisma/seed.ts
fi

echo "==> Starting Next.js on ${HOSTNAME}:${PORT}"
exec node server.js