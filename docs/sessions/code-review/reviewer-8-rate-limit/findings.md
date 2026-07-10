# Adversarial Review — Rate Limiter

Date: 2026-07-10
Reviewer: reviewer-8-rate-limit

## CRITICAL

1. **lib/api/guards.ts:83 — Unbounded memory growth in per-IP `buckets` map.** The `buckets` Map is keyed by client IP and is **never cleaned up**. Expired buckets (where `now >= bucket.resetAt`) are overwritten in place when the same key returns, but buckets for clients who make a single request and never return remain in the map forever. An attacker can exhaust server memory by sending one request from millions of spoofed `x-forwarded-for` IPs. There is no LRU eviction, no periodic cleanup, no max-entries cap. This is a DoS vector against the server itself.

2. **lib/api/guards.ts:89-91 — Trivial bypass via spoofed `x-forwarded-for` header.** The rate limiter trusts `x-forwarded-for` as a client identifier with zero validation. Any client can set this header to a random value on every request and get a fresh rate-limit bucket. The comment says "Vercel populates x-forwarded-for" — but Vercel **appends** to the header, it does not set it. The code does `forwarded.split(",")[0]` which takes the first value, which is the attacker-controlled value, not the real IP. An attacker can bypass the rate limit completely by rotating this header.

3. **lib/api/guards.ts:117-120 — Token bucket is not a token bucket — it allows full reset to max on every refill.** When the window expires (`now >= bucket.resetAt`), the code sets `tokens: max - 1` and a new `resetAt`. This means a client can burst `max` requests at second 59 of window 1, wait 1 millisecond, and burst another `max` requests at second 0 of window 2. There is no continuous refill. The "max" requests per "window" is actually `2 * max` in any 2*windowMs period. This is a leaky-bucket design that behaves as an all-or-nothing fixed-window with full refill at the boundary.

## HIGH

1. **lib/api/guards.ts:83 — No isolation between routes.** All rate limiters across all API routes share the same global `buckets` Map. The client key is the IP alone — there is no route prefix, no handler identifier. This means an attacker hitting `/api/battles/X` burns tokens that would have been used for `/api/battles/X/events/stream`, and vice versa. A single IP gets `max` total requests across all guarded routes, not `max` per route.

2. **lib/api/guards.ts:109-110 — No validation on `max` or `windowMs` options.** The rate limiter accepts arbitrary values. If `max = 0`, the first request gets `tokens: -1`, which means `bucket.tokens <= 0` is true and the request is immediately rejected. If `max = -5`, tokens starts at -6 and every request is rejected. If `windowMs = 0`, the reset is immediate — the bucket is always "expired" and refills to max-1 on every request, effectively disabling rate limiting entirely.

3. **lib/api/guards.ts:118 — Off-by-one: first request in a new window consumes a token before the handler runs.** On a fresh window, `tokens` is set to `max - 1` and the handler executes. This means the first request succeeds with 0 tokens remaining. The next request hits `bucket.tokens <= 0` and is rejected. So with `max = 10`, only 10 requests succeed, but the code comment says "Max requests allowed within the window. Default 10." — which is correct, but the logic is opaque. The concern is that the refill mechanism does not validate that `max - 1 >= 0`. If `max = 0`, the new bucket has `tokens: -1` and the first request is rejected (line 118 sets it but line 119 returns the handler — wait, let me re-check: line 117 condition is `!bucket || now >= bucket.resetAt`, and if true, line 118 sets and line 119 calls handler. So max=0 would call the handler once with tokens=-1, then the next request finds tokens=-1 <= 0 and rejects). The behavior is inconsistent and undocumented.

4. **lib/api/guards.ts:123 — `retryAfter` rounds down to seconds, but the `Retry-After` HTTP header accepts a date.** When `resetAt - now` is 500ms, `Math.ceil(500/1000) = 1`, so the client retries after 1 second. But the bucket resets in 500ms. When `resetAt - now` is 999ms, the client waits 1 second — acceptable. When `resetAt - now` is 100ms, the client still waits 1 full second. Minor precision loss, not a bug per se, but the `retryAfter` in the JSON body is also in seconds, making it impossible for the client to distinguish between a 1-second and a 59-second wait. This is an API contract issue, not a security bug.

## MEDIUM

1. **lib/api/guards.ts:93 — Falls back to `"unknown"` when no IP header is present.** All clients without an `x-forwarded-for` or `x-real-ip` header share the same `"unknown"` bucket. In local dev or server-to-server calls, this means all requests share one rate limit pool. If an attacker discovers that the server doesn't always receive forwarded headers (e.g., misconfigured proxy), all clients get rate-limited together.

2. **lib/api/guards.ts:114 — Uses `Date.now()` which is wall-clock time.** `Date.now()` is affected by NTP corrections, clock jumps, and DST (though JavaScript's `Date.now()` is UTC so DST is not a direct issue). If the system clock jumps backward, `now` decreases, and `bucket.resetAt` (set in the future) never expires, permanently blocking that key. If the clock jumps forward, expired buckets are not cleaned up. `performance.now()` would be monotonically increasing, but it's not available in all Next.js route handler contexts in a consistent way.

3. **lib/api/guards.ts:83 — No max-entries cap on the `buckets` Map.** Even with a 60-second window, the map accumulates one entry per unique IP. A targeted scan of /16 address space would create 65,536 entries. An attacker with access to a botnet could create millions of entries, each consuming ~40 bytes of object overhead. No cap, no LRU, no TTL-based eviction.

4. **lib/api/guards.ts:89-94 — No normalization of IPv6 addresses.** Two different IPv6 representations of the same client (e.g., `::1` vs `0:0:0:0:0:0:0:1`) produce different client keys. An IPv6 client gets effectively unlimited rate limits by rotating address formats. Combined with the spoofable `x-forwarded-for` header, this is a complete bypass.

5. **lib/api/guards.ts:112-135 — The `buckets` Map is a module-level singleton with no mutex.** In a single-threaded Node.js event loop, this is safe for atomic operations. However, Next.js with edge runtime or Vercel serverless functions can have concurrent invocations that share the same module instance. Map operations are atomic in V8, but the read-modify-write sequence (get bucket → check expiry → set new bucket → decrement tokens) is not atomic. Two concurrent requests for the same key could both read `tokens: 1`, both pass the `> 0` check, and both decrement to 0, effectively allowing 2x the intended burst. This is a low-probability race but real in high-concurrency serverless environments.

6. **lib/api/guards.ts:83-84 — Per-process state is silently ineffective in scaled deployments.** The comment acknowledges this ("swap for Redis or Vercel KV"), but there's no warning emitted at runtime if multiple instances are detected. In Vercel's serverless model, each lambda invocation can have a warm or cold container — cold starts reset the entire rate limiter. A determined attacker can time requests to hit cold starts, bypassing the limit entirely.

7. **app/api/battles/route.ts:29-30 — Rate limiter is not applied to POST /api/battles.** The comment says "TODO(be): rate-limit per IP — separate ticket (B5)". The rate limiter exists but is not wired into the most expensive endpoint (battle creation, which may trigger LLM calls). This is a gap in the deployment of the guard, not a bug in the guard itself, but it means the current rate limiter only protects GET endpoints, not the high-cost POST endpoint.

## Summary

- Critical: 3 (unbounded memory growth, spoofable IP bypass, full-burst on window boundary)
- High: 4 (no route isolation, no option validation, opaque first-request behavior, retry-after precision loss)
- Medium: 7 (shared "unknown" bucket, wall-clock vulnerability, no map cap, IPv6 non-normalization, non-atomic read-modify-write, cold-start bypass, POST not guarded)
