import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/lib/demo-data", () => ({
  demoBattle: {
    artifacts: [],
  },
}));

import { ArtifactViewer } from "./artifact-viewer";

describe("ArtifactViewer", () => {
  it("renders 'No artifact selected' when artifacts array is empty", () => {
    const { container } = render(<ArtifactViewer />);
    expect(container.textContent).toContain("No artifact selected");
  });

  it("does not crash when no active artifact exists", () => {
    // Should render without throwing — previously crashed with
    // `Cannot read properties of undefined (reading 'content')`.
    expect(() => render(<ArtifactViewer />)).not.toThrow();
  });
});