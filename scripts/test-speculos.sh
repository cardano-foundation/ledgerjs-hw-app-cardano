#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_REPO="$SCRIPT_DIR/../../ledger-app-cardano"
APP_ELF="${APP_ELF:-$APP_REPO/build/stax/bin/app.elf}"
BASE_APDU_PORT="${SPECULOS_APDU_PORT:-9999}"
DISPLAY_MODE="headless"
PARALLELISM=1
SHARDING_REQUESTED=0
SHOW_PRINTF=0
MOCHA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --display)
      DISPLAY_MODE="qt"
      shift
      ;;
    -n)
      if [[ $# -lt 2 ]]; then
        echo "ERROR: -n requires a positive integer argument." >&2
        exit 1
      fi
      SHARDING_REQUESTED=1
      PARALLELISM="$2"
      shift 2
      ;;
    --printf)
      SHOW_PRINTF=1
      shift
      ;;
    *)
      MOCHA_ARGS+=("$1")
      shift
      ;;
  esac
done

if ! [[ "$PARALLELISM" =~ ^[1-9][0-9]*$ ]]; then
  echo "ERROR: -n must be a positive integer." >&2
  exit 1
fi

if ! [[ "$BASE_APDU_PORT" =~ ^[0-9]+$ ]]; then
  echo "ERROR: SPECULOS_APDU_PORT must be a valid integer port." >&2
  exit 1
fi

if [ ! -f "$APP_ELF" ]; then
  echo "ERROR: app.elf not found at: $APP_ELF" >&2
  echo "Set APP_ELF env var to override." >&2
  exit 1
fi

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

mapfile -t TEST_FILES < <(find "$SCRIPT_DIR/../test/integration" -name '*.test.ts' | sort)

if [ "${#TEST_FILES[@]}" -eq 0 ]; then
  echo "ERROR: No integration tests found." >&2
  exit 1
fi

if (( PARALLELISM > ${#TEST_FILES[@]} )); then
  PARALLELISM=${#TEST_FILES[@]}
fi

if (( SHARDING_REQUESTED == 0 || PARALLELISM < 2 )); then
  PARALLELISM=1
fi

for ((i = 0; i < PARALLELISM; i++)); do
  port=$((BASE_APDU_PORT + i))
  if lsof -iTCP:$port -sTCP:LISTEN &>/dev/null; then
    echo "ERROR: Port $port is already in use. Is another Speculos instance running?" >&2
    exit 1
  fi
done

WORK_DIR="$(mktemp -d)"
SPECULOS_PGIDS=()
MOCHA_PGIDS=()

cleanup() {
  for pgid in "${MOCHA_PGIDS[@]:-}"; do
    kill -- "-$pgid" 2>/dev/null || true
  done
  for pgid in "${SPECULOS_PGIDS[@]:-}"; do
    kill -- "-$pgid" 2>/dev/null || true
  done
  for pgid in "${MOCHA_PGIDS[@]:-}"; do
    wait "$pgid" 2>/dev/null || true
  done
  for pgid in "${SPECULOS_PGIDS[@]:-}"; do
    wait "$pgid" 2>/dev/null || true
  done
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

prefix_stream() {
  local prefix="$1"
  local logfile="$2"
  awk -v prefix="$prefix" '{print prefix $0; fflush()}' | tee "$logfile"
}

sum_matches() {
  local pattern="$1"
  shift
  local total=0
  local value
  for file in "$@"; do
    [ -f "$file" ] || continue
    while IFS= read -r value; do
      total=$((total + value))
    done < <(grep -Eo "$pattern" "$file" | grep -Eo '[0-9]+')
  done
  echo "$total"
}

count_matching_files() {
  local pattern="$1"
  shift
  local total=0
  local file
  for file in "$@"; do
    [ -f "$file" ] || continue
    if grep -q "$pattern" "$file"; then
      total=$((total + 1))
    fi
  done
  echo "$total"
}

collect_failures() {
  local worker="$1"
  local file="$2"
  [ -f "$file" ] || return 0
  awk -v worker="$worker" '
    /\[mocha [0-9]+\][[:space:]]+[0-9]+\)[[:space:]]/ {
      sub(/^.*\][[:space:]]+/, "", $0)
      print "- [mocha " worker "] " $0
    }
  ' "$file"
}

collect_process_errors() {
  local worker="$1"
  local file="$2"
  [ -f "$file" ] || return 0
  awk -v worker="$worker" '
    /\[mocha [0-9]+\][[:space:]]+Exception during run:/ {
      sub(/^.*\][[:space:]]+/, "", $0)
      print "- [mocha " worker "] " $0
    }
  ' "$file"
}

if (( PARALLELISM >= 2 )); then
  for ((i = 0; i < PARALLELISM; i++)); do
    shard_file="$WORK_DIR/shard-$i.txt"
    : >"$shard_file"
  done

  for ((i = 0; i < ${#TEST_FILES[@]}; i++)); do
    shard_index=$((i % PARALLELISM))
    printf '%s\n' "${TEST_FILES[$i]}" >>"$WORK_DIR/shard-$shard_index.txt"
  done
fi

echo "Running integration tests on $PARALLELISM Speculos instance(s)."

for ((i = 0; i < PARALLELISM; i++)); do
  port=$((BASE_APDU_PORT + i))
  echo "Starting speculos[$i]: $APP_ELF (display=$DISPLAY_MODE, apdu-port=$port)"
  SPECULOS_ARGS=()
  if [ "$SHOW_PRINTF" -ne 1 ]; then
    SPECULOS_ARGS+=(--log-level speculos:WARNING)
    SPECULOS_ARGS+=(--log-level apdu:WARNING)
    SPECULOS_ARGS+=(--log-level seproxyhal:WARNING)
  fi
  setsid bash -lc '
    prefix="$1"
    logfile="$2"
    shift 2
    stdbuf -oL -eL "$@" 2>&1 | awk -v prefix="$prefix" "{print prefix \$0; fflush()}" | tee "$logfile"
  ' _ "[speculos $i] " "$WORK_DIR/speculos-$i.log" \
    speculos "$APP_ELF" \
    --seed "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" \
    --display "$DISPLAY_MODE" \
    --apdu-port "$port" \
    --api-port 0 \
    "${SPECULOS_ARGS[@]}" &
  SPECULOS_PGIDS+=($!)
done

for ((i = 0; i < PARALLELISM; i++)); do
  port=$((BASE_APDU_PORT + i))
  echo "Waiting for speculos[$i] on port $port..."
  for attempt in $(seq 1 30); do
    if lsof -iTCP:$port -sTCP:LISTEN &>/dev/null; then
      echo "Speculos[$i] ready."
      break
    fi
    if ! kill -0 "${SPECULOS_PGIDS[$i]}" 2>/dev/null; then
      echo "ERROR: speculos[$i] exited unexpectedly" >&2
      cat "$WORK_DIR/speculos-$i.log" >&2 || true
      exit 1
    fi
    if [ "$attempt" -eq 30 ]; then
      echo "ERROR: Timed out waiting for speculos[$i] on port $port" >&2
      cat "$WORK_DIR/speculos-$i.log" >&2 || true
      exit 1
    fi
    sleep 1
  done
done

if (( PARALLELISM == 1 )); then
  echo "Starting mocha[0] on port $BASE_APDU_PORT."
  setsid env \
    LEDGER_TRANSPORT=speculos \
    SPECULOS_APDU_PORT="$BASE_APDU_PORT" \
    node_modules/.bin/mocha --timeout 3600000 --color \
    -r ts-node/register -r ./test/mocha.setup.ts \
    "test/integration/**/*.test.ts" \
    "${MOCHA_ARGS[@]+"${MOCHA_ARGS[@]}"}" \
    2>&1 | tee "$WORK_DIR/mocha-0.log" &
  MOCHA_PGIDS+=($!)
else
  for ((i = 0; i < PARALLELISM; i++)); do
    mapfile -t SHARD_TESTS <"$WORK_DIR/shard-$i.txt"
    if [ "${#SHARD_TESTS[@]}" -eq 0 ]; then
      continue
    fi
    echo "Starting mocha[$i] with ${#SHARD_TESTS[@]} test file(s) on port $((BASE_APDU_PORT + i))."
    setsid env \
      LEDGER_TRANSPORT=speculos \
      SPECULOS_APDU_PORT="$((BASE_APDU_PORT + i))" \
      bash -lc '
        prefix="$1"
        logfile="$2"
        shift 2
        stdbuf -oL -eL "$@" 2>&1 | awk -v prefix="$prefix" "{print prefix \$0; fflush()}" | tee "$logfile"
      ' _ "[mocha $i] " "$WORK_DIR/mocha-$i.log" \
      bash scripts/run-integration-compiled.sh \
      "${SHARD_TESTS[@]}" \
      "${MOCHA_ARGS[@]+"${MOCHA_ARGS[@]}"}" &
    MOCHA_PGIDS+=($!)
  done
fi

FAILED=0
for ((i = 0; i < ${#MOCHA_PGIDS[@]}; i++)); do
  if ! wait "${MOCHA_PGIDS[$i]}"; then
    FAILED=1
  fi
done

MOCHA_LOGS=()
for ((i = 0; i < PARALLELISM; i++)); do
  MOCHA_LOGS+=("$WORK_DIR/mocha-$i.log")
done

PASSED_COUNT="$(sum_matches '[0-9]+ passing' "${MOCHA_LOGS[@]}")"
FAILED_COUNT="$(sum_matches '[0-9]+ failing' "${MOCHA_LOGS[@]}")"
PENDING_COUNT="$(sum_matches '[0-9]+ pending' "${MOCHA_LOGS[@]}")"
PROCESS_ERROR_COUNT="$(count_matching_files 'Exception during run:' "${MOCHA_LOGS[@]}")"

echo "===== parallel summary ====="
echo "workers: $PARALLELISM"
echo "passed: $PASSED_COUNT"
echo "failed: $FAILED_COUNT"
if [ "$PENDING_COUNT" -ne 0 ]; then
  echo "pending: $PENDING_COUNT"
fi
if [ "$PROCESS_ERROR_COUNT" -ne 0 ]; then
  echo "worker errors: $PROCESS_ERROR_COUNT"
fi

if [ "$FAILED_COUNT" -ne 0 ] || [ "$PROCESS_ERROR_COUNT" -ne 0 ]; then
  echo "failures:"
  for ((i = 0; i < PARALLELISM; i++)); do
    collect_failures "$i" "$WORK_DIR/mocha-$i.log"
    collect_process_errors "$i" "$WORK_DIR/mocha-$i.log"
  done
fi

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi
