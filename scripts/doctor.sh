#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Agent Arena doctor"
echo "root: $ROOT_DIR"

failures=0

check_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "ok file: $path"
  else
    echo "missing file: $path"
    failures=$((failures + 1))
  fi
}

check_dir() {
  local path="$1"
  if [[ -d "$path" ]]; then
    echo "ok dir: $path"
  else
    echo "missing dir: $path"
    failures=$((failures + 1))
  fi
}

check_file README.md
check_file prototype/Agent_Arena_视觉升级_工程实施说明书.md
check_file prototype/agent_arena_prototype.html
check_file docs/CLAUDE.md
check_file docs/design.md
check_file docs/hackathon-demo-runbook.md
check_dir apps/web
check_dir apps/api
check_dir packages/contracts

if [[ -f package.json ]]; then
  echo "ok app scaffold: package.json"
  check_dir lib
  check_dir arena
  check_dir agents
  check_file apps/web/src/App.tsx
  check_file apps/api/src/app.ts
  check_file packages/contracts/src/index.ts
  check_file arena/index.ts
  if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.dev ? 0 : 1)" >/dev/null 2>&1; then
    echo "ok npm script: dev"
  else
    echo "missing npm script: dev"
    failures=$((failures + 1))
  fi
else
  echo "info: no package.json yet; repo is docs-first"
fi

if command -v node >/dev/null 2>&1; then
  echo "ok tool: node $(node --version)"
else
  echo "warn: node not found"
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "ok tool: pnpm $(pnpm --version)"
elif command -v npm >/dev/null 2>&1; then
  echo "ok tool: npm $(npm --version)"
else
  echo "warn: no pnpm/npm found"
fi

if [[ "$failures" -gt 0 ]]; then
  echo "doctor failed with $failures missing required item(s)"
  exit 1
fi

echo "doctor passed"
