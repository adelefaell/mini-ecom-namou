#!/usr/bin/env bash
# Runs the whole stack for local development in a tmux session.
# Requirement: tmux installed.
#
#   ./scripts/dev-tmux.sh
#
# Creates session `mini-ecom` with two windows:
#   backend  : migrate + seed + tsx watch on :3001
#   frontend : vite dev server on :3002 (proxies /api to backend)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="mini-ecom"

if command -v tmux >/dev/null 2>&1; then
  :
else
  echo "tmux not found. Install it, or run each command in its own terminal (see README)." >&2
  exit 1
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '$SESSION' already exists. Attaching." >&2
  tmux attach-session -t "$SESSION"
  exit 0
fi

# Run once per terminal setup: migrations + demo seed.
BACKEND_CMD="cd \"$ROOT/apps/backend\" && pnpm db:migrate && pnpm db:seed && pnpm dev"
FRONTEND_CMD="cd \"$ROOT/apps/frontend\" && pnpm dev"

tmux new-session -d -s "$SESSION" -n backend "bash -c '$BACKEND_CMD'"
tmux new-window -t "$SESSION" -n frontend "bash -c '$FRONTEND_CMD'"

echo "tmux session '$SESSION' started."
echo "  backend  -> http://localhost:3001 (window 0)"
echo "  frontend -> http://localhost:3002 (window 1)"
echo "Attach: tmux attach -t $SESSION   |   Detach: Ctrl-b d"
tmux attach-session -t "$SESSION"