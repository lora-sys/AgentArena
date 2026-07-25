import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { IdeaInputCard } from "./idea-input-card";

describe("IdeaInputCard", () => {
  it("renders label + placeholder + submit", () => {
    const html = renderToStaticMarkup(<IdeaInputCard />);
    expect(html).toContain("你的创意");
    expect(html).toContain("例：帮助大学生准备考试的 AI 学习助手");
    expect(html).toContain("实时开战");
  });

  it("submit is disabled when idea is empty", () => {
    const html = renderToStaticMarkup(<IdeaInputCard />);
    expect(html).toContain("disabled");
  });
});
