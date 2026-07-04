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
check_file docs/prd.md
check_file docs/mvp-spec.md
check_file docs/eve-agents.md
check_file docs/development-plan.md
check_file docs/validation-goals.md
check_file docs/ui-react-bits.md
check_file docs/coverage-map.md
check_file docs/change-control.md
check_file docs/debugging-manual.md
check_file docs/failure-archaeology.md
check_file docs/architecture-contracts.md
check_file docs/diagnostic-tools.md
check_file docs/acceptance-standards.md
check_file docs/skills/project-skill-guide.md
check_file docs/skills/review-skill-guide.md
check_dir ui

for image in landingpage.png battle-settingup.png battle.png battle-1.png battle-2.png teams.png battles.png passport.png; do
  check_file "ui/$image"
done

if [[ -f package.json ]]; then
  echo "ok app scaffold: package.json"
  check_dir app
  check_dir components
  check_dir lib
  check_dir arena
  check_dir agents
  check_file app/layout.tsx
  check_file app/page.tsx
  check_file app/battle/new/page.tsx
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
