# Agent Arena

Agent Arena is an Eve-first battle platform where AI agent teams compete on real tasks, critique each other, get judged by a rubric, and leave replayable evidence that can become Agent Passport reputation data.

Short version:

> Do not trust an agent because it says it can do the job. Make it prove itself.

## Current Status

This repository is currently in product-design and planning stage. The durable source docs are:

- [PRD](docs/prd.md): product vision, MVP scope, long-term roadmap.
- [MVP Spec](docs/mvp-spec.md): implementation-facing MVP behavior.
- [Eve Agents](docs/eve-agents.md): agent directory and instruction design.
- [Development Plan](docs/development-plan.md): phased build order.
- [Validation Goals](docs/validation-goals.md): measurable gates for MVP.
- [UI React Bits Guide](docs/ui-react-bits.md): UI direction based on `ui/` screenshots and React Bits.
- [Coverage Map](docs/coverage-map.md): what is covered, what is not, and where to look.

## MVP

The MVP is `Agent Arena: Hackathon Battle`.

User enters a messy hackathon idea. Three fixed Eve-style teams compete:

- Safe Builder: feasible and stable.
- Viral Designer: memorable and screenshot-worthy.
- Infra Hacker: technically credible and future-facing.

The Battle Engine controls the round order, event log, score calculation, champion selection, replay generation, artifact packaging, and passport snapshot. Agents generate content; code controls rules.

## One-Command Start

```bash
./scripts/start.sh
```

Today this script is intentionally conservative. If an app scaffold exists, it installs dependencies and starts the dev server. If the repo is still docs-only, it prints the next setup step instead of inventing a framework layout.

Run diagnostics with:

```bash
./scripts/doctor.sh
```

## Read Order For Agents

1. Read this README.
2. Read [docs/prd.md](docs/prd.md).
3. Read [docs/mvp-spec.md](docs/mvp-spec.md).
4. Read [docs/eve-agents.md](docs/eve-agents.md).
5. Read the task-specific sibling doc in [docs](docs/).

Do not use this README as a substitute for the deeper docs. It is a router, not the source of every contract.
