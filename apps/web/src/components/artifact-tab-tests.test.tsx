// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { TestResultPayload } from "@agent-arena/contracts";
import { ArtifactTabTests } from "./artifact-tab-tests";

afterEach(cleanup);

const results: TestResultPayload[] = [
  { id: "test_022", teamId: "viral_designer", name: "test_022_share_card_initial", passed: false },
  { id: "test_032", teamId: "viral_designer", name: "test_032_share_card_regression", passed: true },
  { id: "test_052", teamId: "viral_designer", name: "test_052_safari_fallback", passed: true },
];

describe("ArtifactTabTests", () => {
  it("renders all six columns and the three verified tests", () => {
    render(<ArtifactTabTests results={results} />);

    const table = screen.getByRole("table", { name: "作品测试结果" });
    for (const heading of ["测试 ID", "用例名", "输入", "期望", "实际", "结果"]) expect(within(table).getByRole("columnheader", { name: heading })).toBeTruthy();
    expect(within(table).getByText("test_022")).toBeTruthy();
    expect(within(table).getByText("test_032")).toBeTruthy();
    expect(within(table).getByText("test_052")).toBeTruthy();
    expect(within(table).getAllByLabelText("通过")).toHaveLength(2);
    expect(within(table).getByLabelText("未通过")).toBeTruthy();
  });
});
