#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Agent Arena startup"
echo "root: $ROOT_DIR"

if [[ ! -f package.json ]]; then
  echo "No package.json found. Run this script from the Agent Arena repository root."
  exit 0
fi

if [[ -f pnpm-lock.yaml ]]; then
  PM="pnpm"
elif [[ -f package-lock.json ]]; then
  PM="npm"
elif [[ -f yarn.lock ]]; then
  PM="yarn"
elif command -v pnpm >/dev/null 2>&1; then
  PM="pnpm"
elif command -v npm >/dev/null 2>&1; then
  PM="npm"
elif command -v yarn >/dev/null 2>&1; then
  PM="yarn"
else
  echo "No supported package manager found. Install pnpm, npm, or yarn."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies with $PM..."
  "$PM" install
fi

if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.dev ? 0 : 1)" >/dev/null 2>&1; then
  echo "Starting dev server with $PM..."
  "$PM" run dev
else
  echo "package.json exists, but no dev script was found."
  echo "Add the Vite and Hono workspace dev scripts."
  exit 1
fi
