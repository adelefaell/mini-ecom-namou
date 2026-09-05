#!/usr/bin/env bash
# One-shot local run, any tool you prefer.
#
#   ./scripts/run.sh            # interactive picker
#   ./scripts/run.sh docker     # docker compose -f compose.dev.yml up
#   ./scripts/run.sh tmux       # tmux session, backend + frontend windows
#   ./scripts/run.sh manual     # print the manual per-terminal commands
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

usage() {
  echo "Usage: $0 [docker|tmux|manual]" >&2
}

pick() {
  echo "How do you want to run the project?"
  select choice in "docker (compose.dev.yml)" "tmux" "manual (separate terminals)"; do
    case "$choice" in
      "docker (compose.dev.yml)") MODE=docker ;;
      "tmux") MODE=tmux ;;
      "manual (separate terminals)") MODE=manual ;;
      *) echo "Pick 1-3" >&2 ;;
    esac
    [ -n "${MODE:-}" ] && break
  done
}

MODE="${1:-}"
if [ -z "$MODE" ]; then
  pick
else
  case "$MODE" in
    docker|tmux|manual) : ;;
    -h|--help|help) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
fi

case "$MODE" in
  docker)
    echo "Building + starting dev stack (first build takes a while)..."
    docker compose -f compose.dev.yml up --build
    ;;
  tmux)
    exec "$ROOT/scripts/dev-tmux.sh"
    ;;
  manual)
    cat <<'EOF'
Terminal 1 - backend (http://localhost:3001):
  cd apps/backend
  pnpm db:migrate && pnpm db:seed
  pnpm dev

Terminal 2 - frontend (http://localhost:3002):
  cd apps/frontend
  pnpm dev
EOF
    ;;
esac