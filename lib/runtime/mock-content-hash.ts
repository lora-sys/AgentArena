import { createHash } from "node:crypto";

/**
 * Computes a deterministic SHA-256 content hash over the canonical JSON
 * serialization of an array of mock outputs. Used by tests to assert
 * "the mock didn't change underfoot" across runs.
 *
 * Output format: "sha256:<hex>"
 */
export function computeMockContentHash(outputs: unknown[]): string {
  const stable = stableStringify(outputs);
  const hash = createHash("sha256").update(stable).digest("hex");
  return `sha256:${hash}`;
}

/**
 * Deterministic JSON serialization with sorted object keys.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) => JSON.stringify(k) + ":" + stableStringify((value as Record<string, unknown>)[k])
  );
  return "{" + pairs.join(",") + "}";
}