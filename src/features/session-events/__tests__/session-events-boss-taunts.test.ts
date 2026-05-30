/**
 * Tests for session-events feature: evaluateMidSessionEvent boss taunts.
 */

import { evaluateMidSessionEvent } from "../service";
import type { EvaluateMidSessionEventInput } from "../schemas";

describe("evaluateMidSessionEvent – boss taunts", () => {
  const baseInput: EvaluateMidSessionEventInput = {
    bossHealthPercent: 80,
    elapsedSeconds: 300,
    isPaused: false,
    lastEventKey: null,
    purityScore: 75,
    sessionDurationSeconds: 1500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prioritizes near-death taunt when health <= 25", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 20,
      bossTaunts: { nearDeath: "No. Not like this." },
    });
    expect(event?.type).toBe("BOSS_TAUNT");
    expect(event?.message).toBe("No. Not like this.");
    expect(event?.title).toBe("Boss is cracking");
    expect(event?.toastType).toBe("success");
  });

  it("returns half-health taunt when health <= 50", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 45,
      elapsedSeconds: 300,
      bossTaunts: { halfHealth: "You're halfway there." },
    });
    expect(event?.type).toBe("BOSS_TAUNT");
    expect(event?.message).toBe("You're halfway there.");
    expect(event?.title).toBe("Boss taunt");
    expect(event?.toastType).toBe("info");
  });

  it("returns spawn taunt early in session", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 90,
      elapsedSeconds: 95,
      bossTaunts: { spawn: "You dare challenge me?" },
    });
    expect(event?.type).toBe("BOSS_TAUNT");
    expect(event?.message).toBe("You dare challenge me?");
  });

  it("returns null when boss taunts are null", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 20,
      bossTaunts: null,
    });
    // Should fall through to timed events instead
    expect(event?.type).not.toBe("BOSS_TAUNT");
  });

  it("returns null when bossHealthPercent is null", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      bossTaunts: { nearDeath: "test" },
    });
    expect(event?.type).not.toBe("BOSS_TAUNT");
  });

  it("returns null for near-death taunt when health > 25", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 30,
      elapsedSeconds: 900,
      bossTaunts: { nearDeath: "Almost got me." },
    });
    // Should not be a BOSS_TAUNT near-death (health too high)
    // It could be a timed event though
    if (event?.type === "BOSS_TAUNT") {
      expect(event.message).not.toBe("Almost got me.");
    }
  });

  it("does not return spawn taunt after early window", () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 80,
      elapsedSeconds: 300,
      bossTaunts: { spawn: "Too late for this." },
    });
    if (event?.type === "BOSS_TAUNT") {
      expect(event.message).not.toBe("Too late for this.");
    }
  });
});
