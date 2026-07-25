import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HpBar } from "./hp-bar";

describe("HpBar", () => {
  it("renders hp and max", () => {
    const html = renderToStaticMarkup(
      <HpBar hp={68} teamColor="var(--team-viral)" teamName="传播设计师" />,
    );
    expect(html).toContain("68");
    expect(html).toContain("/100");
    expect(html).toContain("传播设计师");
  });

  it("marks low hp below 35", () => {
    const html = renderToStaticMarkup(
      <HpBar hp={38} teamColor="var(--team-viral)" teamName="传播设计师" />,
    );
    expect(html).toContain('data-low="false"');
    const low = renderToStaticMarkup(
      <HpBar hp={20} teamColor="var(--team-viral)" teamName="传播设计师" />,
    );
    expect(low).toContain('data-low="true"');
    expect(low).toContain("var(--danger)");
  });

  it("renders floating damage when lastHit provided", () => {
    const html = renderToStaticMarkup(
      <HpBar
        hp={38}
        teamColor="var(--team-viral)"
        teamName="传播设计师"
        lastHit={{ severity: "fatal", damage: 50, hitId: "attack_031" }}
      />,
    );
    expect(html).toContain("-50");
    expect(html).toContain("floating-damage");
  });
});
