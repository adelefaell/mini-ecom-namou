#!/usr/bin/env bash
# Deploys the current repo state to app-hub over ssh from the main branch.
#
#   ./scripts/deploy.sh
#
# Convention: main = "submission-ready". The script forces a checkout of main,
# pulls the latest, then builds + starts the compose stack on the server.
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-app-hub}"
REMOTE_DIR="${REMOTE_DIR:-~/mini-ecom}"

echo "Deploying main -> $DEPLOY_HOST:$REMOTE_DIR"

ssh -o StrictHostKeyChecking=accept-new "$DEPLOY_HOST" "bash -s" <<'EOF'
set -euo pipefail

cd "$HOME/mini-ecom"

if [ ! -d .git ]; then
  echo "No repo at $HOME/mini-ecom; cloning." >&2
  git clone git@github.com:adelefaell/mini-ecom-namou.git .
fi

git checkout main
git fetch origin main
git reset --hard origin/main

# .env lives on the server, outside git. Warn if missing so the stack can run.
if [ ! -f .env ]; then
  echo "Missing .env on server; copy one before first deploy." >&2
fi

docker compose up -d --build
docker compose ps
EOF

echo "Done. Frontend: http://127.0.0.1:8083"