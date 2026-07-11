import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { connectSse, type SseClientHandle } from "./sse-client";
import type { BattleEvent } from "@/arena";

/**
 * Minimal EventSource mock that records event listeners
 * and exposes helpers to simulate server-pushed messages.
 */
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  readyState = 0;
  onmessage: ((e: MessageEvent<string>) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onopen: (() => void) | null = null;
  closed = false;
  private listeners: Record<string, ((e: MessageEvent<string>) => void)[]> = {};

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  /** Simulate a server-pushed message (data only, matches default EventSource semantics). */
  emitMessage(data: string): void {
    this.onmessage?.({ data } as MessageEvent<string>);
  }

  /** Simulate a typed SSE event (event: <type>\ndata: ...). Fires onmessage
   * and any registered named listeners (matching real EventSource behavior). */
  emitTypedEvent(eventType: string, data: string): void {
    const handlers = this.listeners[eventType] ?? [];
    for (const handler of handlers) {
      handler({ type: eventType, data } as MessageEvent<string>);
    }
    this.onmessage?.({ type: eventType, data } as MessageEvent<string>);
  }

  /** Simulate a connection-level error. Triggers onerror and close. */
  emitError(): void {
    this.readyState = 2;
    this.onerror?.(new Event("error"));
  }

  addEventListener(
    type: string,
    handler: (e: MessageEvent<string>) => void,
  ): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  close(): void {
    this.closed = true;
    this.readyState = 2;
  }

  /** Test helper: number of active instances. */
  static activeCount(): number {
    return MockEventSource.instances.filter((s) => !s.closed).length;
  }

  /** Test helper: latest active instance. */
  static latest(): MockEventSource | undefined {
    const active = MockEventSource.instances.filter((s) => !s.closed);
    return active[active.length - 1];
  }
}

const validEvent: BattleEvent = {
  id: "ev_test_001",
  battleId: "battle-42",
  round: "proposal_round",
  actorType: "team",
  actorId: "safe_builder",
  eventType: "proposal_created",
  title: "Test Proposal",
  content: "A test proposal payload",
  createdAt: "2026-07-09T12:00:00.000Z",
};

describe("sse-client", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("connects to the given URL and creates an EventSource", () => {
    const onEvent = vi.fn();

    const handle: SseClientHandle = connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe(
      "/api/battles/battle-42/events/stream",
    );
    expect(MockEventSource.latest()).toBeDefined();

    handle.close();
  });

  it("parses a message and calls onEvent with a typed BattleEvent", () => {
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    const source = MockEventSource.latest()!;
    source.emitMessage(JSON.stringify(validEvent));

    expect(onEvent).toHaveBeenCalledTimes(1);
    const received = onEvent.mock.calls[0][0] as BattleEvent;
    expect(received.id).toBe("ev_test_001");
    expect(received.eventType).toBe("proposal_created");
    expect(received.battleId).toBe("battle-42");
  });

  it("calls onValidationError when payload fails Zod validation", () => {
    const onEvent = vi.fn();
    const onValidationError = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      onValidationError,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    const source = MockEventSource.latest()!;
    // Missing required fields: id, battleId, round, actorType, eventType, title, content, createdAt
    source.emitMessage(JSON.stringify({ hello: "world" }));

    expect(onEvent).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledTimes(1);
    const [, error] = onValidationError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/validation/i);
  });

  it("calls onValidationError when payload is not valid JSON", () => {
    const onEvent = vi.fn();
    const onValidationError = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      onValidationError,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    const source = MockEventSource.latest()!;
    source.emitMessage("not-valid-json{{{");

    expect(onEvent).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledTimes(1);
  });

  it("reconnects on disconnect with exponential backoff", () => {
    const onEvent = vi.fn();
    const onConnectionError = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      onConnectionError,
      initialBackoffMs: 500,
      maxBackoffMs: 5000,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    expect(MockEventSource.instances).toHaveLength(1);

    // Simulate disconnect
    MockEventSource.instances[0].emitError();
    expect(onConnectionError).toHaveBeenCalledTimes(1);

    // After 500ms backoff, a new EventSource should be created
    vi.advanceTimersByTime(500);
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(1);
    expect(MockEventSource.instances[1]).toBeDefined();
    expect(MockEventSource.instances[1].closed).toBe(false);

    // Simulate another disconnect — should use doubled backoff (1000ms)
    MockEventSource.instances[1].emitError();
    vi.advanceTimersByTime(999);
    // No new instance yet
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(1);
    expect(MockEventSource.instances[2]).toBeDefined();
  });

  it("caps reconnect backoff at maxBackoffMs", () => {
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      initialBackoffMs: 500,
      maxBackoffMs: 2000,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    // Force several disconnects to ramp up the backoff
    // 500 -> 1000 -> 2000 -> 2000 (capped)
    for (let i = 0; i < 4; i++) {
      const latest = MockEventSource.latest();
      if (latest) latest.emitError();
      vi.advanceTimersByTime(2000);
    }

    // After 4th reconnect at 2000ms cap, the next disconnect should still use 2000ms
    const lastSource = MockEventSource.latest()!;
    lastSource.emitError();
    vi.advanceTimersByTime(1999);
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(1);
  });

  it("stops reconnecting after close() is called", () => {
    const onEvent = vi.fn();

    const handle = connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      initialBackoffMs: 500,
      maxBackoffMs: 5000,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    MockEventSource.instances[0].emitError();
    handle.close();

    vi.advanceTimersByTime(10_000);

    // No new EventSource after close
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(0);
  });

  it("does not call onConnectionError after close() (phantom error guard)", () => {
    const onEvent = vi.fn();
    const onConnectionError = vi.fn();

    const handle = connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      onConnectionError,
      initialBackoffMs: 500,
      maxBackoffMs: 5000,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    handle.close();

    // Phantom error after close — must not trigger callback
    MockEventSource.instances[0].emitError();
    expect(onConnectionError).not.toHaveBeenCalled();
  });

  it("does not leak duplicate reconnect timers on rapid disconnects", () => {
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      initialBackoffMs: 500,
      maxBackoffMs: 5000,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    // Trigger first reconnect
    MockEventSource.instances[0].emitError();
    vi.advanceTimersByTime(500);
    // After 500ms, reconnect fires — instance[1] created (backoff doubled to 1000)

    // Second disconnect schedules reconnect at 1000ms backoff
    MockEventSource.instances[1].emitError();
    vi.advanceTimersByTime(1000);

    // Should have exactly 3 instances total: original + 2 reconnects
    expect(MockEventSource.instances.length).toBe(3);
  });

  it("stops reconnecting after maxRetries consecutive failures (R21)", () => {
    // R21 fix: without a max retry cap, onerror would retry forever.
    // With maxRetries=3, after 3 failed reconnect attempts the client
    // must stop creating new EventSource instances.
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      initialBackoffMs: 100,
      maxBackoffMs: 100,
      maxRetries: 3,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    // Failure 1: instance[0] errors, reconnect scheduled → instance[1]
    MockEventSource.instances[0].emitError();
    vi.advanceTimersByTime(100);

    // Failure 2: instance[1] errors, reconnect scheduled → instance[2]
    MockEventSource.instances[1].emitError();
    vi.advanceTimersByTime(100);

    // Failure 3: instance[2] errors, reconnect scheduled → instance[3]
    MockEventSource.instances[2].emitError();
    vi.advanceTimersByTime(100);

    // Failure 4: instance[3] errors — this exceeds maxRetries=3, must stop.
    MockEventSource.instances[3].emitError();

    // Advance time well past any possible backoff — no new instance should appear.
    vi.advanceTimersByTime(10_000);

    // We should have exactly 4 instances (initial + 3 reconnect attempts).
    expect(MockEventSource.instances.length).toBe(4);
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(0);
  });

  it("resets retry counter on successful (re)connect (R21)", () => {
    // R21 fix: a successful onopen must reset the consecutive failure
    // counter so that a healthy connection can later reconnect after
    // a transient blip without being penalized by old failures.
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      initialBackoffMs: 100,
      maxBackoffMs: 100,
      maxRetries: 3,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    // Use up 2 retries.
    MockEventSource.instances[0].emitError();
    vi.advanceTimersByTime(100);
    MockEventSource.instances[1].emitError();
    vi.advanceTimersByTime(100);

    // Healthy connection — onopen fires.
    MockEventSource.instances[2].onopen?.();

    // Now use up 3 more retries. Counter is reset, so we should still reconnect.
    MockEventSource.instances[2].emitError();
    vi.advanceTimersByTime(100);
    MockEventSource.instances[3].emitError();
    vi.advanceTimersByTime(100);
    MockEventSource.instances[4].emitError();
    vi.advanceTimersByTime(100);

    // That's 3 failures after the reset. The 4th failure should stop reconnects.
    MockEventSource.instances[5].emitError();
    vi.advanceTimersByTime(10_000);

    // Total: initial + 2 (before reset) + 3 (after reset, all 3 succeed) = 6
    expect(MockEventSource.instances.length).toBe(6);
    // No additional instance should have been created after the 4th post-reset failure.
    expect(MockEventSource.instances.filter((s) => !s.closed)).toHaveLength(0);
  });

  it("delivers multiple events in order", () => {
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    const source = MockEventSource.latest()!;
    const event1: BattleEvent = { ...validEvent, id: "ev_001" };
    const event2: BattleEvent = {
      ...validEvent,
      id: "ev_002",
      eventType: "attack_created",
    };

    source.emitMessage(JSON.stringify(event1));
    source.emitMessage(JSON.stringify(event2));

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect((onEvent.mock.calls[0][0] as BattleEvent).id).toBe("ev_001");
    expect((onEvent.mock.calls[1][0] as BattleEvent).id).toBe("ev_002");
    expect((onEvent.mock.calls[1][0] as BattleEvent).eventType).toBe(
      "attack_created",
    );
  });

  it("delivers typed SSE events (event: field) via onmessage", () => {
    const onEvent = vi.fn();
    const onValidationError = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      onValidationError,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    const source = MockEventSource.latest()!;
    // Simulate a server pushing `event: proposal_created\ndata: {...}`
    // — the JSON payload already carries eventType, so onmessage delivers it.
    source.emitTypedEvent("proposal_created", JSON.stringify(validEvent));

    expect(onEvent).toHaveBeenCalledTimes(1);
    const received = onEvent.mock.calls[0][0] as BattleEvent;
    expect(received.eventType).toBe("proposal_created");
    expect(received.id).toBe("ev_test_001");
    expect(onValidationError).not.toHaveBeenCalled();
  });

  it("dispatches each event exactly once (no duplicate handler firing)", () => {
    const onEvent = vi.fn();

    connectSse({
      url: "/api/battles/battle-42/events/stream",
      onEvent,
      EventSourceCtor: MockEventSource as unknown as typeof EventSource,
    });

    const source = MockEventSource.latest()!;
    // Emit both a default message and a typed event — each must fire onEvent exactly once.
    source.emitMessage(JSON.stringify(validEvent));
    source.emitTypedEvent("proposal_created", JSON.stringify(validEvent));

    expect(onEvent).toHaveBeenCalledTimes(2);
  });
});