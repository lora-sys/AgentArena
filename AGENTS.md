# Agent Arena Agent Instructions

## Read First

Every agent working in this repository must start here, then read the task-specific source docs.

Required order:

1. [README.md](README.md)
2. [docs/project-status.md](docs/project-status.md)
3. [docs/development-plan.md](docs/development-plan.md)
4. [docs/acceptance-standards.md](docs/acceptance-standards.md)
5. The source doc for the area you are touching:
   - Product behavior: [docs/mvp-spec.md](docs/mvp-spec.md)
   - Runtime boundaries: [docs/architecture-contracts.md](docs/architecture-contracts.md)
   - Eve agents: [docs/eve-agents.md](docs/eve-agents.md)
   - UI direction: [docs/ui-react-bits.md](docs/ui-react-bits.md)

## Current Build Phase

The project is in Phase 4 entry:

- Phase 1 static MVP shell is implemented.
- Phase 2 deterministic Battle Engine is implemented and drives the seeded UI view model.
- Phase 3 Eve directory skeleton is implemented and still needs a runtime adapter.
- Phase 4 deterministic API paths exist; the Live page still needs real polling/SSE binding and durable persistence later.

For authoritative status, use [docs/project-status.md](docs/project-status.md). Update that file whenever you finish a meaningful step.

## Command Rules

- Prefix shell commands with `rtk`.
- Use `rg`/`rtk grep` for search before slower alternatives.
- Use `apply_patch` for manual file edits.
- Do not delete or revert user or parallel-agent changes.
- Do not run destructive git commands.

## Development Rules

- The Battle Engine owns rules: state transitions, score calculation, champion selection, replay generation, passport generation.
- Agents generate content only. They do not decide round order or winners.
- UI must read from product data or local interactive state. Do not hardcode business rules inside presentation components.
- Seeded demo data is allowed, but it should match the eventual runtime shape.
- Every visible button/control should either work, navigate, open a modal/menu, update state, or be clearly removed.
- Use React Bits only as copied local source or as inspiration for local components. Do not import remote runtime code.

## Documentation Sync Protocol

After every meaningful phase step, update docs in the same change:

1. Update [docs/project-status.md](docs/project-status.md):
   - Current phase.
   - Completed work.
   - Incomplete work.
   - Unresolved files or areas.
   - Proposed resolution.
   - Verification evidence.
2. If product behavior changed, update [docs/mvp-spec.md](docs/mvp-spec.md).
3. If runtime contracts changed, update [docs/architecture-contracts.md](docs/architecture-contracts.md).
4. If UI behavior or visual direction changed, update [docs/ui-react-bits.md](docs/ui-react-bits.md) and [docs/acceptance-standards.md](docs/acceptance-standards.md) if gates changed.
5. If commands or diagnostics changed, update [README.md](README.md), [docs/diagnostic-tools.md](docs/diagnostic-tools.md), or scripts as appropriate.

No phase should be considered complete unless the tracker names the verification command or runtime evidence.

## Subagent Workflow

Prefer subagents for bounded parallel work, especially:

- Engine/runtime slice.
- Eve agent directory slice.
- UI activation review.
- Documentation consistency review.
- Final audit.

Keep write scopes disjoint. Tell subagents they are not alone in the codebase and must not revert others' work. The main agent owns integration, final review, and docs/status synchronization.

## Verification Baseline

Before handoff, run the relevant subset:

```bash
rtk npm run typecheck
rtk npm run build
rtk ./scripts/doctor.sh
```

For UI work, also open the app at `http://localhost:3000` and verify the touched routes in browser screenshots or snapshots.

When the user requests `@浏览器` / Browser plugin verification, use the bundled in-app Browser plugin and save evidence under `artifacts/e2e/<date>-browser/`.

## Known Product Priorities

1. Bind dynamic battle pages to `/api/battles/[id]` instead of rendering demo aliases.
2. Add Live page event polling/SSE consumption.
3. Add the Eve adapter boundary and deterministic mock adapter.
4. Replace local mock auth and battle rows after persistence exists.
5. Add CI and repeatable browser QA once the browser runner is selected for non-interactive automation.
