# Review Skill Guide: Three-Way Parallel Review

## Purpose

Use this guide to review Agent Arena docs, scripts, plans, and implementation changes. The review must split into three independent lenses and then reconcile findings.

Do not use this guide to implement fixes. Use it to find issues. After review, apply [../change-control.md](../change-control.md) for meaningful changes.

## When To Use

Use when:

- A doc set changed.
- Startup or diagnostic commands changed.
- Product scope changed.
- Architecture contracts changed.
- Agent skills or instructions changed.
- A change claims MVP readiness.

Do not use when:

- The task is a tiny typo fix.
- You are actively debugging a runtime failure. Start with [../debugging-manual.md](../debugging-manual.md).
- You are writing a postmortem. Use [../failure-archaeology.md](../failure-archaeology.md).

## Review Lane A: Fact And Command Accuracy

Mission:

Find false facts, invented commands, stale flags, missing files, broken links, and unsupported setup claims.

Checklist:

- Every command exists or is clearly future/planned.
- Every script named in docs exists.
- Every file link resolves.
- React Bits claims are limited to confirmed capabilities or marked as implementation-time verification.
- No package manager command is promised before `package.json` exists.
- No Eve API detail is invented beyond current project contracts.
- No dates or metrics are presented as real when they are sample/seeded.

Output format:

```md
Fact findings:
- [P0/P1/P2] File:line - Issue - Evidence - Suggested fix
```

## Review Lane B: Logic And Contract Consistency

Mission:

Find contradictions between PRD, MVP spec, architecture contracts, UI guide, scripts, and skill docs.

Checklist:

- Battle Engine owns deterministic flow everywhere.
- Agents generate content, not rules.
- Score calculation is code-owned everywhere.
- Replay and Passport are event-derived everywhere.
- MVP scope does not include deferred marketplace/protocol features.
- UI guide does not contradict screenshot direction.
- Acceptance standards match validation goals.
- Change control points to all affected sibling docs.

Output format:

```md
Logic findings:
- [P0/P1/P2] File:line - Conflict - Conflicting source - Suggested fix
```

## Review Lane C: Usability And Trigger Precision

Mission:

Find vague instructions that an agent cannot operationalize.

Checklist:

- Each doc says when to use it.
- Each doc says when not to use it.
- Each doc points to sibling docs.
- Skills have precise trigger conditions.
- The README routes but does not pretend to replace deeper docs.
- Acceptance gates are testable.
- Debugging steps are ordered.
- Review outputs have clear format.

Output format:

```md
Usability findings:
- [P0/P1/P2] File:line - Ambiguity - Why it blocks the agent - Suggested fix
```

## Severity

- P0: Can cause wrong implementation, fake demo claims, broken startup, or product contract violation.
- P1: Can cause confusion, duplicated work, or unreliable review.
- P2: Clarity/polish issue.

## Reconciliation

After the three lanes finish:

1. Deduplicate findings.
2. Keep the highest severity when lanes disagree.
3. Separate required fixes from optional polish.
4. Confirm which sibling docs must change.
5. Do not mark review complete until command accuracy, logic consistency, and usability have all been checked.
