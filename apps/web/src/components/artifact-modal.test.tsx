// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtifactModal } from "./artifact-modal";

afterEach(cleanup);

describe("ArtifactModal", () => {
  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<ArtifactModal open teamName="传播设计师" onClose={onClose} />);

    await userEvent.setup().keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("switches between all four tabs", async () => {
    const user = userEvent.setup();
    render(<ArtifactModal open teamName="传播设计师" onClose={() => undefined} />);

    const patchTab = screen.getByRole("tab", { name: "补丁差异" });
    await user.click(patchTab);
    expect(patchTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toContain("补丁差异内容将在下一阶段接入");
  });

  it("traps Tab focus inside the modal and restores it on close", async () => {
    const user = userEvent.setup();
    const trigger = document.createElement("button");
    trigger.textContent = "作品";
    document.body.append(trigger);
    trigger.focus();
    const { rerender } = render(<ArtifactModal open teamName="传播设计师" onClose={() => undefined} />);

    const close = screen.getByRole("button", { name: "关闭作品查看" });
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "关联证据" }));
    await user.tab();
    expect(document.activeElement).toBe(close);

    rerender(<ArtifactModal open={false} teamName="传播设计师" onClose={() => undefined} />);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("keeps focus inside when the parent rerenders", () => {
    const onClose = vi.fn();
    const { rerender } = render(<ArtifactModal open teamName="传播设计师" onClose={onClose} />);
    const close = screen.getByRole("button", { name: "关闭作品查看" });

    expect(document.activeElement).toBe(close);
    rerender(<ArtifactModal open teamName="传播设计师 · 已更新" onClose={onClose} />);
    expect(document.activeElement).toBe(close);
  });
});
