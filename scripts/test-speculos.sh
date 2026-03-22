#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_REPO="$SCRIPT_DIR/../../ledger-app-cardano"
APP_ELF="${APP_ELF:-$APP_REPO/build/stax/bin/app.elf}"
APDU_PORT=9999
DISPLAY_MODE="headless"
MOCHA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --display) DISPLAY_MODE="qt"; shift ;;
    *) MOCHA_ARGS+=("$1"); shift ;;
  esac
done

# Validate app.elf
if [ ! -f "$APP_ELF" ]; then
  echo "ERROR: app.elf not found at: $APP_ELF" >&2
  echo "Set APP_ELF env var to override." >&2
  exit 1
fi

# Activate venv from ledger-app-cardano if speculos not already on PATH
VENV="$APP_REPO/tests/venv/bin/activate"
if ! command -v speculos &>/dev/null; then
  if [ ! -f "$VENV" ]; then
    echo "ERROR: speculos not found on PATH and venv not found at: $VENV" >&2
    echo "Set up the venv in ledger-app-cardano first (see its doc/testing.md)." >&2
    exit 1
  fi
  # shellcheck source=/dev/null
  source "$VENV"
fi

if ! command -v speculos &>/dev/null; then
  echo "ERROR: speculos not found even after activating venv at: $VENV" >&2
  exit 1
fi

# Check port is free
if lsof -iTCP:$APDU_PORT -sTCP:LISTEN &>/dev/null; then
  echo "ERROR: Port $APDU_PORT is already in use. Is speculos already running?" >&2
  exit 1
fi

echo "Starting speculos: $APP_ELF (display=$DISPLAY_MODE)"
speculos "$APP_ELF" \
  --seed "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" \
  --display "$DISPLAY_MODE" \
  --apdu-port "$APDU_PORT" &
SPECULOS_PID=$!

cleanup() {
  echo "Stopping speculos (pid $SPECULOS_PID)..."
  kill "$SPECULOS_PID" 2>/dev/null || true
  wait "$SPECULOS_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Wait for speculos to be ready
echo "Waiting for speculos on port $APDU_PORT..."
for i in $(seq 1 30); do
  if lsof -iTCP:$APDU_PORT -sTCP:LISTEN &>/dev/null; then
    echo "Speculos ready."
    break
  fi
  if ! kill -0 "$SPECULOS_PID" 2>/dev/null; then
    echo "ERROR: speculos exited unexpectedly" >&2
    exit 1
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Timed out waiting for speculos on port $APDU_PORT" >&2
    exit 1
  fi
  sleep 1
done

LEDGER_TRANSPORT=speculos yarn test-integration "${MOCHA_ARGS[@]+"${MOCHA_ARGS[@]}"}"
