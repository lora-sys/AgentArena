// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MiniPassportCard } from "./mini-passport-card";

afterEach(cleanup);

describe("MiniPassportCard", () => {
  it("explains an incomplete live passport without inventing a champion", () => {
    render(<MemoryRouter><MiniPassportCard battleId="live-123" /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "本场战斗尚未产生完整护照快照" })).toBeTruthy();
    expect(screen.queryByText("冠军已验证")).toBeNull();
    expect(screen.getByRole("link", { name: "返回 Live Arena" }).getAttribute("href")).toBe("/battle/live-123?mode=live_runtime");
    expect(screen.getByRole("link", { name: "观看已验证演示" }).getAttribute("href")).toContain("BA-2026-0024/champion");
  });
});
