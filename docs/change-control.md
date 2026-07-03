# Change Control

## Purpose

Use this document before changing product scope, architecture contracts, data schemas, agent behavior, or UI direction.

Do not use it to debug a failing run; use [debugging-manual.md](debugging-manual.md). Do not use it for acceptance criteria; use [acceptance-standards.md](acceptance-standards.md). Do not use it to review docs; use [skills/review-skill-guide.md](skills/review-skill-guide.md).

## Change Classes

### Class A: Product Contract Change

Examples:

- New battle round.
- New team role.
- Changed scoring weights.
- Replay or Passport semantics change.

Required updates:

- [prd.md](prd.md)
- [mvp-spec.md](mvp-spec.md)
- [architecture-contracts.md](architecture-contracts.md)
- [acceptance-standards.md](acceptance-standards.md)

### Class B: Runtime Implementation Change

Examples:

- Event store adapter.
- Agent invocation adapter.
- Schema validation strategy.
- Streaming or polling.

Required updates:

- [mvp-spec.md](mvp-spec.md)
- [architecture-contracts.md](architecture-contracts.md)
- [debugging-manual.md](debugging-manual.md)
- [diagnostic-tools.md](diagnostic-tools.md)

### Class C: UI Direction Change

Examples:

- Replace screenshot target.
- Add React Bits component category.
- Change team colors.
- Change navigation model.

Required updates:

- [ui-react-bits.md](ui-react-bits.md)
- [acceptance-standards.md](acceptance-standards.md)

### Class D: Docs Or Skill Change

Examples:

- New project skill.
- Review process change.
- Debug playbook change.

Required updates:

- Relevant file in [skills](skills/)
- [README.md](../README.md) if navigation changes.

## Minimum Change Record

Every meaningful change should state:

- What changed.
- Why now.
- What docs were updated.
- What validation proves it.
- What was deliberately not changed.

## Red Flags

Pause and review before merging if:

- A model controls a deterministic battle rule.
- A doc says one thing and a schema says another.
- A command appears in docs but is not supported by scripts or package.json.
- UI docs promise a component not present in source or planned install path.
- Passport claims cross-battle reputation before cross-battle data exists.
