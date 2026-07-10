import { describe, expect, it } from "vitest";
import {
  ALLOWED_TOOLS,
  AllowedToolName,
  DisallowedToolError,
  assertAllowed,
  isAllowed,
} from "./allowlist";

describe("agents/tools/allowlist", () => {
  describe("ALLOWED_TOOLS", () => {
    it("contains the expected tool names", () => {
      // Lock the allowlist shape — adding a tool must be a deliberate edit.
      expect(ALLOWED_TOOLS).toEqual([
        "format_proposal",
        "calculate_score",
        "export_markdown",
      ]);
    });

    it("contains only unique entries", () => {
      const unique = new Set(ALLOWED_TOOLS);
      expect(unique.size).toBe(ALLOWED_TOOLS.length);
    });
  });

  describe("isAllowed", () => {
    it("returns true for an allowed tool", () => {
      expect(isAllowed("format_proposal")).toBe(true);
      expect(isAllowed("calculate_score")).toBe(true);
      expect(isAllowed("export_markdown")).toBe(true);
    });

    it("returns false for a tool not on the list", () => {
      expect(isAllowed("shell")).toBe(false);
      expect(isAllowed("exec")).toBe(false);
      expect(isAllowed("fs_write")).toBe(false);
      expect(isAllowed("")).toBe(false);
    });

    it("is case-sensitive", () => {
      // Convention is snake_case — uppercase variants are NOT allowed.
      expect(isAllowed("FORMAT_PROPOSAL")).toBe(false);
      expect(isAllowed("Format_Proposal")).toBe(false);
    });
  });

  describe("assertAllowed", () => {
    it("does not throw for an allowed tool", () => {
      expect(() => assertAllowed("format_proposal")).not.toThrow();
      expect(() => assertAllowed("calculate_score")).not.toThrow();
      expect(() => assertAllowed("export_markdown")).not.toThrow();
    });

    it("throws DisallowedToolError for a tool not on the list", () => {
      expect(() => assertAllowed("shell")).toThrow(DisallowedToolError);
      expect(() => assertAllowed("exec")).toThrow(DisallowedToolError);
      expect(() => assertAllowed("unknown_tool")).toThrow(DisallowedToolError);
    });

    it("attaches the rejected tool name to the error", () => {
      try {
        assertAllowed("shell");
        // Should not reach here
        expect.fail("expected assertAllowed to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(DisallowedToolError);
        const err = error as DisallowedToolError;
        expect(err.toolName).toBe("shell");
        expect(err.message).toContain("shell");
        expect(err.message).toContain("allowlist");
      }
    });

    it("the error message references PRD §7 invariant #4", () => {
      try {
        assertAllowed("eval");
      } catch (error) {
        const err = error as Error;
        expect(err.message).toMatch(/PRD.*7|invariant.*4/);
      }
    });
  });

  describe("AllowedToolName type", () => {
    it("exposes the allowlist as a union of literal strings", () => {
      // Type-level check: the type narrows to literal strings, not just `string`.
      // This is a compile-time guarantee, but we exercise it at runtime to
      // confirm the export is the expected union.
      const names: AllowedToolName[] = [
        "format_proposal",
        "calculate_score",
        "export_markdown",
      ];
      expect(names).toHaveLength(ALLOWED_TOOLS.length);
      for (const name of names) {
        expect(isAllowed(name)).toBe(true);
      }
    });
  });
});
