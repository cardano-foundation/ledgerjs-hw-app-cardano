#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_DIR="$(mktemp -d /tmp/ledgerjs-integration-XXXXXX)"
MOCHA_ARGS=()
TEST_FILES=()

cleanup() {
  rm -rf "$BUILD_DIR"
}
trap cleanup EXIT

for arg in "$@"; do
  if [[ "$arg" == *.test.ts ]]; then
    if [[ "$arg" = /* ]]; then
      normalized_path="$(realpath "$arg")"
      rel_path="${normalized_path#$REPO_ROOT/}"
    else
      rel_path="$arg"
    fi
    TEST_FILES+=("$BUILD_DIR/${rel_path%.ts}.js")
  else
    MOCHA_ARGS+=("$arg")
  fi
done

(
  cd "$REPO_ROOT"
  ./node_modules/.bin/tsc -p test/tsconfig.json --outDir "$BUILD_DIR"
)

if [ "${#TEST_FILES[@]}" -eq 0 ]; then
  mapfile -t TEST_FILES < <(find "$BUILD_DIR/test/integration" -name '*.test.js' | sort)
fi

NODE_PATH="$REPO_ROOT/node_modules${NODE_PATH+:$NODE_PATH}" \
  node "$REPO_ROOT/node_modules/mocha/bin/mocha" \
    --timeout 3600000 \
    -r "$BUILD_DIR/test/mocha.setup.js" \
    "${TEST_FILES[@]}" \
    "${MOCHA_ARGS[@]}"
