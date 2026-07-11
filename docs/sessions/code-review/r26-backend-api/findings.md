# R26 Backend API

Date: 2026-07-10

## CRITICAL

1. **app/api/battles/route.ts:126-134** — When the DB insert fails for a reason other than unique-violation (or unique-violation recovery lookup fails), the route falls through and returns `HTTP 201 Created` with `{ battleId, status: "created", inMemory: true }`. No battle was actually persisted to the database, but the client receives a 201 status that implies successful creation. The deterministic `battleId` returned has no corresponding row in the `battle` table. The client's follow-up poll to `/api/battles/[id]/status` will return 404 "Battle not found", breaking the create-then-poll contract. The endpoint should return a non-2xx status (e.g. 503 Service Unavailable) or the `inMemory: true` flag must be explicitly handled by every client.

## Summary

- Criticals: 1