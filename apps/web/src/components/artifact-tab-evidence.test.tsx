// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtifactTabEvidence } from "./artifact-tab-evidence";

afterEach(cleanup);

describe("ArtifactTabEvidence", () => {
  it("selects a linked event for Arena navigation", async () => {
    const onSelect = vi.fn();
    render(<ArtifactTabEvidence eventIds={["evt_006", "evt_013", "evt_016"]} onSelect={onSelect} />);

    await userEvent.setup().click(screen.getByRole("button", { name: /evt_013/ }));
    expect(onSelect).toHaveBeenCalledWith("evt_013");
  });
});
