import { describe, expect, it, beforeEach } from "@jest/globals";
import {
  processCompletedSessionPromise,
  getHomePromiseState,
  keepPromise,
  dismissRecovery,
} from "../service";
import {
  toDateKey,
  mapSessionModeToTargetMode,
  buildNextPromiseInput,
  isMatchOrBetter,
  MinimumPromiseMinutes,
} from "../service-helpers";
import {
  createPromise,
  getRecentPromises,
  getPendingPromise,
  replacePromise,
  fulfillPromise,
  markPromiseMissed,
  dismissRecoveryPromise,
  CompanionPromiseRepositoryError,
} from "../repository";
import {
  PromiseTargetModeSchema,
  CompanionPromiseStatusSchema,
  CompanionPromiseSchema,
  CompanionPromiseHomeStateSchema,
  CompanionPromiseLifecycleResultSchema,
  CreateCompanionPromiseInputSchema,
  CompletedSessionPromiseInputSchema,
} from "../schemas";

// ── Mocks ──────────────────────────────────────────────────────────────
jest.mock("../repository", () => ({
  createPromise: jest.fn(),
  dismissRecoveryPromise: jest.fn(),
  fulfillPromise: jest.fn(),
  getPendingPromise: jest.fn(),
  getRecentPromises: jest.fn(),
  markPromiseMissed: jest.fn(),
  replacePromise: jest.fn(),
}));
jest.mock("../analytics", () => ({
  trackPromiseCreated: jest.fn(),
  trackPromiseFulfilled: jest.fn(),
  trackPromiseMissed: jest.fn(),
  trackPromiseRecovered: jest.fn(),
}));
jest.mock("../events", () => ({
  publishPromiseCreated: jest.fn(),
  publishPromiseFulfilled: jest.fn(),
  publishPromiseMissed: jest.fn(),
  publishPromiseRecovered: jest.fn(),
}));

const repository = jest.requireMock("../repository") as Record<string, jest.Mock>;

const basePromise = {
  createdAt: "2026-05-20T10:00:00.000Z",
  fulfilledAt: null,
  id: "550e8400-e29b-41d4-a716-446655440001",
  missedAt: null,
  sourceSessionId: "550e8400-e29b-41d4-a716-446655440002",
  status: "pending" as const,
  targetDate: "2026-05-21",
  targetDurationMinutes: 25,
  targetMode: "FOCUS" as const,
  userId: "user-123",
};

// ── service-helpers ────────────────────────────────────────────────────
describe("service-helpers", () => {
  describe("toDateKey", () => {
    it("formats a UTC timestamp as YYYY-MM-DD", () => {
      const ts = Date.parse("2026-05-20T12:00:00.000Z");
      const key = toDateKey(ts, "UTC");
      expect(key).toBe("2026-05-20");
    });

    it("respects timezone for date boundary", () => {
      // 2026-05-20T03:00:00 UTC is still 2026-05-19 in America/New_York (EDT = UTC-4)
      const ts = Date.parse("2026-05-20T03:00:00.000Z");
      const key = toDateKey(ts, "America/New_York");
      expect(key).toBe("2026-05-19");
    });

    it("handles midnight boundary in UTC", () => {
      const ts = Date.parse("2026-05-20T00:00:00.000Z");
      expect(toDateKey(ts, "UTC")).toBe("2026-05-20");
    });
  });

  describe("mapSessionModeToTargetMode", () => {
    it("maps RECOVERY to RECOVERY", () => {
      expect(mapSessionModeToTargetMode("RECOVERY")).toBe("RECOVERY");
    });
    it("maps STUDY to STUDY", () => {
      expect(mapSessionModeToTargetMode("STUDY")).toBe("STUDY");
    });
    it("maps CHALLENGE to BOSS_PREP", () => {
      expect(mapSessionModeToTargetMode("CHALLENGE")).toBe("BOSS_PREP");
    });
    it("maps CREATIVE to HABIT_BUILD", () => {
      expect(mapSessionModeToTargetMode("CREATIVE")).toBe("HABIT_BUILD");
    });
    it("maps FLOW to FOCUS (default)", () => {
      expect(mapSessionModeToTargetMode("FLOW")).toBe("FOCUS");
    });
    it("maps unknown mode to FOCUS (default)", () => {
      expect(mapSessionModeToTargetMode("UNKNOWN")).toBe("FOCUS");
    });
  });

  describe("buildNextPromiseInput", () => {
    it("returns correct shape with targetDate +1 day", () => {
      const input = {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440099",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      const result = buildNextPromiseInput(input, "UTC");
      expect(result.targetDate).toBe("2026-05-21");
      expect(result.targetDurationMinutes).toBe(25);
      expect(result.targetMode).toBe("FOCUS");
      expect(result.userId).toBe("user-123");
      expect(result.sourceSessionId).toBe(input.sessionId);
    });

    it("enforces MinimumPromiseMinutes floor", () => {
      const input = {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 2,
        sessionId: "550e8400-e29b-41d4-a716-446655440099",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      const result = buildNextPromiseInput(input, "UTC");
      expect(result.targetDurationMinutes).toBe(MinimumPromiseMinutes);
    });
  });

  describe("isMatchOrBetter", () => {
    it("returns true when session matches target date, duration, and mode", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(true);
    });

    it("returns true when duration exceeds target", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 40,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(true);
    });

    it("returns false when date does not match", () => {
      const input = {
        completedAt: Date.parse("2026-05-22T14:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(false);
    });

    it("returns false when duration is too short", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 10,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(false);
    });

    it("returns false when mode does not match", () => {
      const input = {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 25,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "STUDY",
        userId: "user-123",
      };
      expect(isMatchOrBetter(input, basePromise, "UTC")).toBe(false);
    });
  });
});

// ── service: processCompletedSessionPromise ────────────────────────────
describe("service: processCompletedSessionPromise", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.createPromise.mockResolvedValue(basePromise);
    repository.dismissRecoveryPromise.mockResolvedValue({ ...basePromise, status: "replaced" });
    repository.getPendingPromise.mockResolvedValue(null);
    repository.getRecentPromises.mockResolvedValue([]);
    repository.markPromiseMissed.mockResolvedValue({
      ...basePromise,
      status: "missed",
      missedAt: "2026-05-22T10:00:00.000Z",
    });
    repository.replacePromise.mockResolvedValue({ ...basePromise, status: "replaced" });
    repository.fulfillPromise.mockResolvedValue({
      ...basePromise,
      status: "fulfilled",
      fulfilledAt: "2026-05-21T12:00:00.000Z",
    });
  });

  it("creates a new promise for a qualifying session (>= 5 minutes)", async () => {
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 25,
        sessionId: basePromise.sourceSessionId,
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "UTC",
    );
    expect(result.createdPromise).not.toBeNull();
    expect(result.createdPromise?.targetMode).toBe("FOCUS");
    expect(repository.createPromise).toHaveBeenCalledTimes(1);
  });

  it("skips promise creation for short sessions (< 5 minutes)", async () => {
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 3,
        sessionId: basePromise.sourceSessionId,
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "UTC",
    );
    expect(result.createdPromise).toBeNull();
    expect(repository.createPromise).not.toHaveBeenCalled();
  });

  it("replaces an older pending promise from a different session", async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T11:00:00.000Z"),
        durationMinutes: 30,
        sessionId: "550e8400-e29b-41d4-a716-446655440099",
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "UTC",
    );
    expect(repository.replacePromise).toHaveBeenCalledWith(basePromise.id);
  });

  it("fulfills a matching promise on the target date", async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-21T14:00:00.000Z"),
        durationMinutes: 30,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "UTC",
    );
    expect(result.fulfilledPromise?.status).toBe("fulfilled");
  });

  it("marks expired promise as missed", async () => {
    repository.getPendingPromise.mockResolvedValue({
      ...basePromise,
      targetDate: "2026-05-19",
    });
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse("2026-05-20T10:00:00.000Z"),
        durationMinutes: 30,
        sessionId: "550e8400-e29b-41d4-a716-446655440098",
        sessionMode: "FLOW",
        userId: basePromise.userId,
      },
      "UTC",
    );
    expect(result.missedPromise).not.toBeNull();
    expect(repository.markPromiseMissed).toHaveBeenCalled();
  });
});

// ── service: getHomePromiseState ───────────────────────────────────────
describe("service: getHomePromiseState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.getPendingPromise.mockResolvedValue(null);
    repository.getRecentPromises.mockResolvedValue([]);
  });

  it("returns hidden when online with no promises", async () => {
    const state = await getHomePromiseState("user-123", true, "UTC");
    expect(state.kind).toBe("hidden");
  });

  it("returns offline when offline with no promises", async () => {
    const state = await getHomePromiseState("user-123", false, "UTC");
    expect(state.kind).toBe("offline");
    expect(state.showOfflineBanner).toBe(true);
  });

  it("returns pending when a pending promise exists for today", async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    // Use a now that matches targetDate "2026-05-21" in UTC
    const state = await getHomePromiseState(
      "user-123",
      true,
      "UTC",
      Date.parse("2026-05-21T12:00:00.000Z"),
    );
    expect(state.kind).toBe("pending");
    if ("promise" in state) {
      expect(state.promise.id).toBe(basePromise.id);
    }
  });

  it("returns fulfilled when latest promise is fulfilled", async () => {
    const fulfilled = { ...basePromise, status: "fulfilled" as const };
    repository.getRecentPromises.mockResolvedValue([fulfilled]);
    const state = await getHomePromiseState("user-123", true, "UTC");
    expect(state.kind).toBe("fulfilled");
  });

  it("returns missed when latest promise is missed", async () => {
    const missed = { ...basePromise, status: "missed" as const };
    repository.getRecentPromises.mockResolvedValue([missed]);
    const state = await getHomePromiseState("user-123", true, "UTC");
    expect(state.kind).toBe("missed");
  });

  it("shows offline banner when offline with pending promise", async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    const state = await getHomePromiseState("user-123", false, "UTC");
    expect(state.showOfflineBanner).toBe(true);
  });
});

// ── service: keepPromise / dismissRecovery ─────────────────────────────
describe("service: keepPromise", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.dismissRecoveryPromise.mockResolvedValue({ ...basePromise, status: "replaced" });
  });

  it("calls dismissRecoveryPromise and returns result", async () => {
    const result = await keepPromise(basePromise);
    expect(result.status).toBe("replaced");
    expect(repository.dismissRecoveryPromise).toHaveBeenCalledWith(basePromise.id);
  });
});

describe("service: dismissRecovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.dismissRecoveryPromise.mockResolvedValue({ ...basePromise, status: "replaced" });
  });

  it("delegates to dismissRecoveryPromise", async () => {
    await dismissRecovery(basePromise.id);
    expect(repository.dismissRecoveryPromise).toHaveBeenCalledWith(basePromise.id);
  });
});

// ── schemas ────────────────────────────────────────────────────────────
describe("companion-promise schemas", () => {
  it("PromiseTargetModeSchema accepts valid modes", () => {
    for (const mode of ["FOCUS", "RECOVERY", "STUDY", "BOSS_PREP", "HABIT_BUILD"]) {
      expect(PromiseTargetModeSchema.safeParse(mode).success).toBe(true);
    }
    expect(PromiseTargetModeSchema.safeParse("INVALID").success).toBe(false);
  });

  it("CompanionPromiseStatusSchema accepts valid statuses", () => {
    for (const status of ["pending", "fulfilled", "missed", "replaced"]) {
      expect(CompanionPromiseStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(CompanionPromiseStatusSchema.safeParse("invalid").success).toBe(false);
  });

  it("CompanionPromiseSchema validates correct shape", () => {
    expect(CompanionPromiseSchema.safeParse(basePromise).success).toBe(true);
  });

  it("CompanionPromiseSchema rejects invalid UUID", () => {
    expect(CompanionPromiseSchema.safeParse({ ...basePromise, id: "not-a-uuid" }).success).toBe(false);
  });

  it("CompanionPromiseHomeStateSchema validates all kinds", () => {
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: "hidden", showOfflineBanner: false }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: "offline", showOfflineBanner: true }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: "pending", promise: basePromise, showOfflineBanner: false }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: "fulfilled", promise: basePromise, showOfflineBanner: false }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: "missed", promise: basePromise, showOfflineBanner: false }).success,
    ).toBe(true);
  });

  it("CompanionPromiseLifecycleResultSchema validates correct shape", () => {
    const result = CompanionPromiseLifecycleResultSchema.safeParse({
      createdPromise: null,
      fulfilledPromise: null,
      missedPromise: null,
    });
    expect(result.success).toBe(true);
  });

  it("CreateCompanionPromiseInputSchema validates correct shape", () => {
    const result = CreateCompanionPromiseInputSchema.safeParse({
      createdAt: "2026-05-20T10:00:00.000Z",
      sourceSessionId: "550e8400-e29b-41d4-a716-446655440002",
      targetDate: "2026-05-21",
      targetDurationMinutes: 25,
      targetMode: "FOCUS",
      userId: "user-123",
    });
    expect(result.success).toBe(true);
  });

  it("CreateCompanionPromiseInputSchema rejects duration < 5", () => {
    const result = CreateCompanionPromiseInputSchema.safeParse({
      createdAt: "2026-05-20T10:00:00.000Z",
      sourceSessionId: "550e8400-e29b-41d4-a716-446655440002",
      targetDate: "2026-05-21",
      targetDurationMinutes: 3,
      targetMode: "FOCUS",
      userId: "user-123",
    });
    expect(result.success).toBe(false);
  });

  it("CompletedSessionPromiseInputSchema validates correct shape", () => {
    const result = CompletedSessionPromiseInputSchema.safeParse({
      completedAt: Date.now(),
      durationMinutes: 25,
      sessionId: "550e8400-e29b-41d4-a716-446655440002",
      sessionMode: "FLOW",
      userId: "user-123",
    });
    expect(result.success).toBe(true);
  });
});
