// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtifactLiveDegradedCard } from "./artifact-live-degraded-card";

afterEach(cleanup);

describe("ArtifactLiveDegradedCard", () => {
  it("explains missing live evidence and returns to verified replay", async () => {
    const onReturnVerified = vi.fn();
    render(<ArtifactLiveDegradedCard onReturnVerified={onReturnVerified} />);

    expect(screen.getByRole("heading", { name: "实时演示证据不完整" })).toBeTruthy();
    expect(screen.getByText("当前实时运行未产出可查看的作品版本对比，请返回观看已验证演示以获得完整证据链。")).toBeTruthy();
    await userEvent.setup().click(screen.getByRole("button", { name: "返回已验证演示" }));
    expect(onReturnVerified).toHaveBeenCalledOnce();
  });
});
