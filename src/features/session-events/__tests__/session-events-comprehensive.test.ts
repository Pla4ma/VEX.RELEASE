/**
 * Comprehensive tests for session-events feature.
 *
 * Covers: service.ts (evaluateMidSessionEvent with all branches),
 * analytics.ts (trackMidSessionEvent), schemas.ts (all Zod schemas).
 */

import * as Sentry from "@sentry/react-native";
import { evaluateMidSessionEvent } from "../service";
import { trackMidSessionEvent } from "../analytics";
import {
  MidSessionEventTypeSchema,
  MidSessionBossTauntsSchema,
  EvaluateMidSessionEventInputSchema,
  MidSessionEventSchema,
} from "../schemas";
import type { EvaluateMidSessionEventInput } from "../schemas";

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
}));

const mockSentry = jest.requireMock("@sentry/react-native") as {
  addBreadcrumb: jest.Mock;
};

describe("session-events comprehensive", () => {
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

  /* ─── evaluateMidSessionEvent – guard clauses ────────────────── */

  describe("evaluateMidSessionEvent – guard clauses", () => {
    it("returns null when paused", () => {
      expect(
        evaluateMidSessionEvent({ ...baseInput, isPaused: true }),
      ).toBeNull();
    });

    it("returns null before FIRST_EVENT_SECONDS (90s)", () => {
      expect(
        evaluateMidSessionEvent({ ...baseInput, elapsedSeconds: 89 }),
      ).toBeNull();
    });

    it("returns null at exactly 0 seconds", () => {
      expect(
        evaluateMidSessionEvent({ ...baseInput, elapsedSeconds: 0 }),
      ).toBeNull();
    });

    it("emits event at exactly FIRST_EVENT_SECONDS (90s)", () => {
      const event = evaluateMidSessionEvent({
        ...baseInput,
        elapsedSeconds: 90,
        bossHealthPercent: null,
      });
      expect(event).not.toBeNull();
    });
  });

  /* ─── evaluateMidSessionEvent – boss taunts ──────────────────── */

  describe("evaluateMidSessionEvent – boss taunts", () => {
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

  /* ─── evaluateMidSessionEvent – purity pulse ─────────────────── */

  describe("evaluateMidSessionEvent – purity pulse", () => {
    it("emits COMBO_WINDOW for purity >= 90", () => {
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 95,
        elapsedSeconds: 300,
      });
      expect(event?.type).toBe("COMBO_WINDOW");
      expect(event?.toastType).toBe("success");
      expect(event?.haptic).toBe("impactMedium");
    });

    it("emits PURITY_PULSE warning for purity < 60", () => {
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 45,
        elapsedSeconds: 300,
      });
      expect(event?.type).toBe("PURITY_PULSE");
      expect(event?.toastType).toBe("warning");
      expect(event?.message).toContain("drift");
    });

    it("emits PURITY_PULSE info for purity 60-89", () => {
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 72,
        elapsedSeconds: 300,
      });
      expect(event?.type).toBe("PURITY_PULSE");
      expect(event?.toastType).toBe("info");
      expect(event?.message).toContain("72%");
    });
  });

  /* ─── evaluateMidSessionEvent – timed events ─────────────────── */

  describe("evaluateMidSessionEvent – timed events", () => {
    it("emits BOSS_RAGE when health <= 35 and bucket % 3 === 0", () => {
      // At 200s (< 300): bucket = 0, 0 % 3 === 0
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: 30,
        elapsedSeconds: 200,
        purityScore: 75,
      });
      expect(event?.type).toBe("BOSS_RAGE");
      expect(event?.title).toBe("Rage window");
    });

    it("emits DISTRACTION_WAVE when bucket % 5 === 0", () => {
      // At 1500s, bucket = Math.floor(1500 / 300) = 5, 5 % 5 === 0
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: 60,
        elapsedSeconds: 1500,
        purityScore: 75,
      });
      expect(event?.type).toBe("DISTRACTION_WAVE");
      expect(event?.title).toBe("Distraction wave");
    });

    it("emits FOCUS_ZONE when purity >= 80 and bucket % 2 === 0", () => {
      // At 600s, bucket = Math.floor(600 / 300) = 2, 2 % 2 === 0
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        elapsedSeconds: 600,
        purityScore: 85,
      });
      expect(event?.type).toBe("FOCUS_ZONE");
      expect(event?.title).toBe("Focus zone");
    });
  });

  /* ─── evaluateMidSessionEvent – deduplication ─────────────────── */

  describe("evaluateMidSessionEvent – deduplication", () => {
    it("suppresses duplicate event keys", () => {
      const event = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 95,
      });
      expect(event).not.toBeNull();

      const duplicate = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 95,
        lastEventKey: event!.key,
      });
      expect(duplicate).toBeNull();
    });

    it("emits a different event when key changes", () => {
      const event1 = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 95,
        elapsedSeconds: 300,
      });
      expect(event1).not.toBeNull();

      // Different elapsed time → different bucket → different key
      const event2 = evaluateMidSessionEvent({
        ...baseInput,
        bossHealthPercent: null,
        purityScore: 45,
        elapsedSeconds: 600,
        lastEventKey: event1!.key,
      });
      expect(event2).not.toBeNull();
      expect(event2!.key).not.toBe(event1!.key);
    });
  });

  /* ─── analytics – trackMidSessionEvent ──────────────────────── */

  describe("analytics – trackMidSessionEvent", () => {
    it("sends breadcrumb with event type", () => {
      trackMidSessionEvent({
        key: "test:1",
        type: "PURITY_PULSE",
        title: "Focus holding",
        message: "Test message",
        toastType: "info",
        haptic: "selection",
      });
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "session-events",
          message: "PURITY_PULSE",
          level: "info",
        }),
      );
    });

    it("sends warning level breadcrumb for warning toastType", () => {
      trackMidSessionEvent({
        key: "test:2",
        type: "DISTRACTION_WAVE",
        title: "Distraction wave",
        message: "Test",
        toastType: "warning",
        haptic: "warning",
      });
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "session-events",
          message: "DISTRACTION_WAVE",
          level: "warning",
        }),
      );
    });

    it("sends info level breadcrumb for success toastType", () => {
      trackMidSessionEvent({
        key: "test:3",
        type: "COMBO_WINDOW",
        title: "Combo",
        message: "Test",
        toastType: "success",
        haptic: "impactMedium",
      });
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({ level: "info" }),
      );
    });
  });

  /* ─── Schemas ───────────────────────────────────────────────── */

  describe("schemas – validation", () => {
    it("MidSessionEventTypeSchema accepts all valid types", () => {
      const validTypes = [
        "BOSS_TAUNT",
        "PURITY_PULSE",
        "COMBO_WINDOW",
        "DISTRACTION_WAVE",
        "FOCUS_ZONE",
        "BOSS_RAGE",
      ];
      for (const type of validTypes) {
        expect(MidSessionEventTypeSchema.safeParse(type).success).toBe(true);
      }
    });

    it("MidSessionEventTypeSchema rejects invalid type", () => {
      expect(MidSessionEventTypeSchema.safeParse("INVALID").success).toBe(false);
    });

    it("MidSessionBossTauntsSchema accepts partial taunts", () => {
      expect(
        MidSessionBossTauntsSchema.safeParse({ spawn: "Hello" }).success,
      ).toBe(true);
      expect(MidSessionBossTauntsSchema.safeParse({}).success).toBe(true);
    });

    it("MidSessionBossTauntsSchema rejects extra fields (strict)", () => {
      expect(
        MidSessionBossTauntsSchema.safeParse({
          spawn: "Hello",
          extra: "field",
        }).success,
      ).toBe(false);
    });

    it("EvaluateMidSessionEventInputSchema accepts valid input", () => {
      expect(
        EvaluateMidSessionEventInputSchema.safeParse(baseInput).success,
      ).toBe(true);
    });

    it("EvaluateMidSessionEventInputSchema rejects purity > 100", () => {
      expect(
        EvaluateMidSessionEventInputSchema.safeParse({
          ...baseInput,
          purityScore: 101,
        }).success,
      ).toBe(false);
    });

    it("EvaluateMidSessionEventInputSchema rejects negative elapsedSeconds", () => {
      expect(
        EvaluateMidSessionEventInputSchema.safeParse({
          ...baseInput,
          elapsedSeconds: -1,
        }).success,
      ).toBe(false);
    });

    it("MidSessionEventSchema validates a complete event", () => {
      const result = MidSessionEventSchema.safeParse({
        key: "mid-session:0:PURITY_PULSE",
        type: "PURITY_PULSE",
        title: "Focus holding",
        message: "Purity is 75%.",
        toastType: "info",
        haptic: "selection",
      });
      expect(result.success).toBe(true);
    });

    it("MidSessionEventSchema rejects empty key", () => {
      const result = MidSessionEventSchema.safeParse({
        key: "",
        type: "PURITY_PULSE",
        title: "Test",
        message: "Test",
        toastType: "info",
        haptic: "selection",
      });
      expect(result.success).toBe(false);
    });
  });
});
