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

# Seed when DEMO_SEED=true (explicit wipe+reseed) OR database has no users (first boot).
should_seed=false
if [ "$DEMO_SEED" = "true" ]; then
  echo "==> DEMO_SEED=true — will re-seed (destructive wipe + demo data)"
  should_seed=true
else
  user_count="$(node <<'NODE'
const Database = require("better-sqlite3");
const raw = process.env.DATABASE_URL || "file:/data/dev.db";
const path = raw.replace(/^file:/, "");
try {
  const db = new Database(path, { readonly: true, fileMustExist: false });
  const row = db.prepare("SELECT COUNT(*) AS c FROM User").get();
  process.stdout.write(String(row && row.c != null ? row.c : 0));
  db.close();
} catch {
  // Missing DB/table → treat as empty so first boot still seeds.
  process.stdout.write("0");
}
NODE
)"
  if [ "${user_count:-0}" = "0" ]; then
    echo "==> No users in database — seeding demo data (first boot)"
    should_seed=true
  else
    echo "==> Database has ${user_count} user(s) — skipping seed (DEMO_SEED=false)"
  fi
fi

if [ "$should_seed" = "true" ]; then
  echo "==> Seeding demo data..."
  npx tsx prisma/seed.ts
fi

echo "==> Starting Next.js on ${HOSTNAME}:${PORT}"
exec node server.js
