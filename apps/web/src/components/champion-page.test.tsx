// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ChampionPage } from "./champion-page";
import { TeamPassport } from "./team-passport";
import { EvidenceLensModal } from "./evidence-lens-modal";
import { verifiedShowcasePassport } from "../data/verified-showcase";

afterEach(cleanup);

describe("ChampionPage", () => {
  it("reveals the verified champion and renders weaknesses", () => {
    render(<MemoryRouter initialEntries={["/battle/BA-2026-0024/champion"]}><Routes><Route path="/battle/:battleId/champion" element={<ChampionPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "传播设计师", level: 1 })).toBeTruthy();
    expect(screen.getAllByText("87", { selector: "strong" })).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "弱点" })).toBeTruthy();
    expect(screen.getByText("初版遗漏 Safari 16.4 兼容性")).toBeTruthy();
    expect(screen.getByRole("link", { name: /attack_031 暴露 Safari 致命缺陷/ }).getAttribute("href")).toContain("event=evt_008");
  });

  it("uses the same demo power score in Evidence Lens and Passport", () => {
    const first = render(<MemoryRouter><TeamPassport battleId="BA-2026-0024" passport={verifiedShowcasePassport} /></MemoryRouter>);
    const passportDemo = within(first.container).getByText("演示力").closest("article");
    expect(passportDemo?.textContent).toContain("19/25");
    first.unmount();
    const second = render(<EvidenceLensModal open teamName="传播设计师" totalScore={87} completeness="full_breakdown" scores={verifiedShowcasePassport.scores} onClose={() => undefined} />);
    const lensDemo = within(second.container).getByText("演示力").closest("article");
    expect(lensDemo?.textContent).toContain("19/25");
  });
});
