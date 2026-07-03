# Diagnostic Tools

## Purpose

Use this document to understand and maintain project health checks.

Do not use it as a debugging narrative; use [debugging-manual.md](debugging-manual.md). Do not use it as acceptance criteria; use [acceptance-standards.md](acceptance-standards.md). Do not use it to change architecture; use [architecture-contracts.md](architecture-contracts.md).

## Scripts

### `scripts/doctor.sh`

Checks:

- Current directory.
- Required docs.
- UI screenshot assets.
- Script presence.
- Node/package manager availability.
- Whether app scaffold exists.

Use before:

- Starting implementation.
- Handoff.
- Demo rehearsal.
- After changing scripts or README.

### `scripts/start.sh`

Starts the app if a supported package script exists. It is conservative while this repo is docs-first.

Supported package managers:

- `pnpm`
- `npm`
- `yarn`

Expected future behavior:

- Install dependencies if needed.
- Start the dev server.
- Print local URL.

## Future Diagnostics

Add these after app scaffold exists:

- `scripts/check-docs.sh`: verify documented commands exist.
- `scripts/check-fixtures.sh`: validate seeded battle data.
- `scripts/check-battle.sh`: run one deterministic battle.
- `scripts/check-ui.sh`: run route smoke checks.
- `scripts/export-demo.sh`: generate markdown export from seeded battle.

## Rule

No diagnostic script should require secrets, live model keys, or network unless explicitly named as a live check.
