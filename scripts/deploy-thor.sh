#!/usr/bin/env bash
# Deploy TheLocal.nexus demo to Thor (192.168.50.11)
set -euo pipefail

HOST="${DEPLOY_HOST:-administrator@192.168.50.11}"
REMOTE_DIR="${DEPLOY_PATH:-~/development/thelocal}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Syncing to ${HOST}:${REMOTE_DIR}"
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude dev.db \
  --exclude prisma/dev.db \
  --exclude .git \
  --exclude .grok \
  "${ROOT}/" "${HOST}:${REMOTE_DIR}/"

echo "==> Building and starting on Thor (port 3000) — DEMO_SEED=false, volume preserved"
ssh "${HOST}" bash -s <<'REMOTE'
set -euo pipefail
cd ~/development/thelocal
# Persist DEMO_SEED=false so rebuilds never wipe thelocal-data
if [ -f .env ]; then
  if grep -q '^DEMO_SEED=' .env; then
    sed -i 's/^DEMO_SEED=.*/DEMO_SEED=false/' .env
  else
    echo 'DEMO_SEED=false' >> .env
  fi
else
  echo 'DEMO_SEED=false' > .env
fi
export DEMO_SEED=false
# CRITICAL: do not use down -v — keeps existing thelocal-data volume
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
echo "==> Waiting for health..."
sleep 8
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
echo "==> DEMO_SEED in running container:"
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T thelocal printenv DEMO_SEED || true
curl -sf -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000/ || true
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs thelocal --tail 40
REMOTE

echo "==> Deploy complete"
echo "    LAN:  http://192.168.50.11:3000"
echo "    Domain (via edge proxy): https://thelocal.arctek.us"
