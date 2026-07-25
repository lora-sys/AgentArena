import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ArenaHost } from "./arena-host";

describe("ArenaHost", () => {
  it("renders chinese title", () => {
    const html = renderToStaticMarkup(<ArenaHost round="proposal_round" />);
    expect(html).toContain("主持人解说");
    expect(html).toContain("Arena Host");
  });

  it("uses round-keyed copy", () => {
    const html = renderToStaticMarkup(<ArenaHost round="cross_attack_round" />);
    expect(html).toContain("攻防开启");
  });

  it("prefers custom line over round default", () => {
    const html = renderToStaticMarkup(<ArenaHost round="briefing" line="自定义解说词" />);
    expect(html).toContain("自定义解说词");
    expect(html).not.toContain("三队就位");
  });

  it("records round and team for downstream styling", () => {
    const html = renderToStaticMarkup(<ArenaHost round="judging_round" activeTeamId="team_viral_v1" />);
    expect(html).toContain('data-round="judging_round"');
    expect(html).toContain('data-team="team_viral_v1"');
  });
});
