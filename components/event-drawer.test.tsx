import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventDrawer } from "./event-drawer";
import type { BattleEvent } from "@/arena/schemas/types";

const makeEvent = (overrides: Partial<BattleEvent> = {}): BattleEvent => ({
  id: "evt-001",
  battleId: "battle-42",
  round: "judging_round",
  actorType: "judge",
  actorId: "judge_panel",
  eventType: "score_created",
  title: "Viral Designer scored 8.50",
  content: "Strong demo path and pitch.",
  rawPayload: {
    teamId: "viral_designer",
    scores: { novelty: 8, feasibility: 7, demoWow: 9, technicalDepth: 7, userValue: 8, longTermPotential: 9 },
    judgeComments: ["Excellent demo path."],
    winningReason: "Clear winner on demo wow factor",
  },
  createdAt: "2026-07-04T19:18:00.000Z",
  ...overrides,
});

const mockAllEvents: BattleEvent[] = [
  makeEvent(),
  {
    id: "evt-002",
    battleId: "battle-42",
    round: "proposal_round",
    actorType: "team",
    actorId: "viral_designer",
    eventType: "proposal_created",
    title: "NoteFlow proposed",
    content: "AI note-taking app",
    createdAt: "2026-07-04T18:34:00.000Z",
  },
];

describe("EventDrawer", () => {
  it("opens when an event is provided with open=true", () => {
    const event = makeEvent();
    render(
      <EventDrawer event={event} open onClose={() => {}} allEvents={mockAllEvents} />,
    );
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(event.title)).toBeDefined();
  });

  it("renders nothing when open is false", () => {
    const event = makeEvent();
    const { container } = render(
      <EventDrawer event={event} open={false} onClose={() => {}} allEvents={mockAllEvents} />,
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("shows full payload when drawer is open", () => {
    const event = makeEvent({
      rawPayload: { teamId: "safe_builder", custom: "test-value" },
    });
    render(
      <EventDrawer event={event} open onClose={() => {}} allEvents={mockAllEvents} />,
    );
    const payloadText = screen.getByText(/"teamId"/);
    expect(payloadText).toBeDefined();
    expect(screen.getByText(/"test-value"/)).toBeDefined();
  });

  it("closes when Esc key is pressed", async () => {
    const event = makeEvent();
    const onClose = vi.fn();
    render(
      <EventDrawer event={event} open onClose={onClose} allEvents={mockAllEvents} />,
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when backdrop is clicked", () => {
    const event = makeEvent();
    const onClose = vi.fn();
    const { container } = render(
      <EventDrawer event={event} open onClose={onClose} allEvents={mockAllEvents} />,
    );
    const backdrop = container.querySelector(".drawer-backdrop")!;
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows judge reasoning for score events", () => {
    const event = makeEvent();
    render(
      <EventDrawer event={event} open onClose={() => {}} allEvents={mockAllEvents} />,
    );
    const reasoning = screen.getByText(/Winning:/).closest("section");
    expect(reasoning).toBeDefined();
    expect(reasoning!.textContent).toContain("Excellent demo path.");
  });

  it("shows linked event ids when applicable", () => {
    const scoreEvent = makeEvent({
      eventType: "score_created",
      rawPayload: { teamId: "viral_designer" },
    });
    render(
      <EventDrawer event={scoreEvent} open onClose={() => {}} allEvents={mockAllEvents} />,
    );
    const linkedSection = screen.getByText("Linked Events");
    expect(linkedSection).toBeDefined();
    const evtLink = screen.getByText("evt-002");
    expect(evtLink).toBeDefined();
  });

  it("renders close button with accessible label", () => {
    const event = makeEvent();
    render(
      <EventDrawer event={event} open onClose={() => {}} allEvents={mockAllEvents} />,
    );
    expect(screen.getByLabelText("Close event drawer")).toBeDefined();
  });

  afterEach(() => {
    cleanup();
  });
});