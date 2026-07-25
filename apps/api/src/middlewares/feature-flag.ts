/**
 * Feature flag for live_runtime (issue #44).
 *
 * Write-locked (docs/DEV-STANDARDS.md §6):
 *   - AGENT_ARENA_LIVE_BATTLE_ENABLED=false (default) → POST /api/battles 501
 *   - Only flipped to true in the pitch environment.
 */

export function isLiveBattleEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const value = env.AGENT_ARENA_LIVE_BATTLE_ENABLED;
  if (typeof value !== "string") return typeof env.STEPFUN_API_KEY === "string" && env.STEPFUN_API_KEY.trim().length > 0;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}
