// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MiniAppDemo } from "./mini-app-demo";

afterEach(cleanup);

describe("MiniAppDemo", () => {
  it("changes difficulty and question count, then generates locally", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<MiniAppDemo />);

    await user.selectOptions(screen.getByRole("combobox", { name: "选择难度" }), "hard");
    const slider = screen.getByRole("slider", { name: "题目数量" });
    fireEvent.change(slider, { target: { value: "12" } });
    await user.click(screen.getByRole("button", { name: "生成题目" }));

    expect(screen.getByText("难度：难")).toBeTruthy();
    expect(screen.getByText("已生成 12 道题目")).toBeTruthy();
    expect(screen.getByRole("list").children).toHaveLength(3);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
