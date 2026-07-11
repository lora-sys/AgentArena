# R24 Backend API

Date: 2026-07-10

## CRITICAL
1. app/api/battles/[id]/export/route.ts:24 — Unsanitized `row.title` and `row.idea` from DB are interpolated directly into a markdown response body. An attacker who creates a battle via POST /api/battles with an `idea` containing `\n`, `\r`, or `---` can inject arbitrary markdown that breaks the `split("---\n\n")` boundary and corrupts the export structure. Title/idea should be escaped or the split logic made robust against embedded separator sequences.

2. app/api/battles/[id]/status/route.ts:91-101 — The catch (DB-unavailable) branch returns a response object missing the `status` field that the success branch returns (line 85: `status: battleRow.status`). Clients consuming this endpoint will receive `undefined` for `status` during DB failures, producing inconsistent shape vs the documented contract.

## Summary
- Criticals: 2
