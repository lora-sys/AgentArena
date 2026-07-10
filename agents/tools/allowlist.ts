// Tool allowlist — single enforce point for all agent tool invocations.
//
// PRD §7 invariant #4 (CLAUDE.md):
//   "No tool allowlist outside agents/tools/allowlist.ts. No shell, no exec,
//    no fs.write outside the artifact writer's own output dir."
//
// This module is the only place tool names are enumerated. The agent runtime
// must call assertAllowed(toolName) before dispatching any tool. Any new tool
// added to the arena must be listed in ALLOWED_TOOLS below; tools absent from
// the list will throw DisallowedToolError when assertAllowed is called.
//
// Note: Mastra currently does not execute tools; this boundary is
// defense-in-depth and the single point of review for tool additions.

/**
 * The canonical list of tool names permitted for agent invocation.
 *
 * Convention: snake_case. Must match the exported function name from the
 * tool module. Example: formatProposal in
 * agents/safe-builder/tools/format_proposal.ts is registered as
 * format_proposal.
 */
export const ALLOWED_TOOLS: readonly string[] = [
  // Proposal formatters — one per team (per-agent pure string formatters)
  "format_proposal",
  // Judge scoring (pure calculation, no side effects)
  "calculate_score",
  // Artifact export (the ONLY tool that may write to disk, within its own
  // output directory — see artifact-writer/tools/export_markdown.ts)
  "export_markdown",
] as const;

/**
 * Typed view of the allowlist — useful for compile-time exhaustiveness checks.
 */
export type AllowedToolName = (typeof ALLOWED_TOOLS)[number];

/**
 * O(1) lookup set built once at module load.
 */
const ALLOWED_TOOL_SET: ReadonlySet<string> = new Set(ALLOWED_TOOLS);

/**
 * Returns true if the given tool name is on the allowlist.
 */
export function isAllowed(toolName: string): boolean {
  return ALLOWED_TOOL_SET.has(toolName);
}

/**
 * Thrown when assertAllowed rejects a tool name.
 * Callers should let this propagate — it signals a PRD invariant violation.
 */
export class DisallowedToolError extends Error {
  readonly toolName: string;

  constructor(toolName: string) {
    super(
      `Tool "${toolName}" is not on the allowlist (agents/tools/allowlist.ts). ` +
        `Add it to ALLOWED_TOOLS before invoking. PRD §7 invariant #4.`,
    );
    this.name = "DisallowedToolError";
    this.toolName = toolName;
  }
}

/**
 * Asserts that a tool name is on the allowlist.
 * Throws DisallowedToolError if not. The runtime boundary must call this
 * before every tool dispatch — it is the single enforce point.
 */
export function assertAllowed(toolName: string): void {
  if (!isAllowed(toolName)) {
    throw new DisallowedToolError(toolName);
  }
}
