/**
 * Rate limiter for POST /api/battles (issue #44).
 *
 * Write-locked (docs/DEV-STANDARDS.md §6):
 *   - 5 battles per IP per 10 minutes.
 *   - 429 + Retry-After on overflow.
 *
 * Implementation: in-memory fixed-window. Good enough for a single-node demo
 * deploy; swap for Redis if the API is ever multi-instance.
 */

export type RateLimitDecision =
  | { allowed: true; remaining: number; resetAtMs: number }
  | { allowed: false; retryAfterSeconds: number; resetAtMs: number };

export type RateLimiterOptions = {
  windowMs?: number;
  maxAttempts?: number;
  now?: () => number;
};

const DEFAULT_WINDOW_MS = 10 * 60 * 1_000; // 10 minutes
const DEFAULT_MAX_ATTEMPTS = 5;

export class BattleRateLimiter {
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly now: () => number;
  private readonly buckets = new Map<string, { count: number; resetAtMs: number }>();

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    this.maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.now = options.now ?? Date.now;
  }

  check(key: string): RateLimitDecision {
    const now = this.now();
    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAtMs) {
      const resetAtMs = now + this.windowMs;
      this.buckets.set(key, { count: 1, resetAtMs });
      return { allowed: true, remaining: this.maxAttempts - 1, resetAtMs };
    }
    if (bucket.count >= this.maxAttempts) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAtMs - now) / 1_000));
      return { allowed: false, retryAfterSeconds, resetAtMs: bucket.resetAtMs };
    }
    bucket.count += 1;
    return { allowed: true, remaining: this.maxAttempts - bucket.count, resetAtMs: bucket.resetAtMs };
  }

  /** Test hook: drop all state. */
  reset(): void {
    this.buckets.clear();
  }
}
