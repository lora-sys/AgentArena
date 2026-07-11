# R20 Backend API

Date: 2026-07-10

## CRITICAL

1. `app/api/battles/route.ts:86` — `battleId` is generated as `btl_<8-char base32>` via `makeBattleId(idea)`, but `lib/db/schema.ts:147` defines `battle.id` as `uuid("id").primaryKey().defaultRandom()`. The insert on line 86 passes a non-UUID string into a Postgres `uuid` column, which will raise a type error (`invalid input syntax for type uuid`) and return 500 on every `POST /api/battles` call. The route test mocks the DB client so this is never caught at test time.

2. `lib/battle-api.ts:67-71` — `toBase32Eight` computes `hash2` with the identical FNV-1a pass over the same input as `hash` on lines 58-62. The comment claims "Mix in a second pass … to add more entropy" but the two hashes are always equal, so `hash2 & 0xff` is always `hash & 0xff`. The combined 40-bit ID is effectively 32 bits, not 40, making the battle ID space half of what the code implies and creating unnecessary collision risk for the unique `idea` index.

## Summary
- Criticals: 2
