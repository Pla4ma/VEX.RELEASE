/**
 * Session Feature — Comprehensive Tests
 *
 * Covers: idGenerator, modes, validation, lifecycle-validators, retry-strategy,
 * retry-factories, notification templates, recovery-analysis, persistence-resume
 */

// ─── idGenerator ──────────────────────────────────────────────────────────────

import {
  generateSessionId,
  generateShortId,
  generateUUID,
  IdGenerator,
} from "../utils/idGenerator";

// ─── modes ────────────────────────────────────────────────────────────────────

import {
  SessionMode,
  SessionModeSchema,
  SESSION_MODE_CONFIG,
  resolveSessionMode,
  getSessionModeConfig,
  getRecoveryChainMultiplier,
  getSprintChainMultiplier,
} from "../modes";

// ─── validation ───────────────────────────────────────────────────────────────

import {
  validateSessionConfig,
  validateSessionStart,
  validateSessionPause,
  validateSessionCompletion,
  formatValidationErrors,
  hasErrors,
  hasWarnings,
  getFirstError,
  SessionValidation,
} from "../utils/validation";

// ─── field-validators ─────────────────────────────────────────────────────────

import { FieldValidators } from "../utils/field-validators";

// ─── retry ────────────────────────────────────────────────────────────────────

import { RetryStrategy } from "../utils/RetryStrategy";
import { DEFAULT_RETRY_CONFIG } from "../utils/retry-strategy-types";
import { createRetryStrategy, getRetryStrategy } from "../utils/retry-factories";

// ─── notification templates ───────────────────────────────────────────────────

import {
  buildInterruptionPayload,
  buildRecoveryPayload,
  buildStreakWarningPayload,
  buildDailyReminderPayload,
  buildBreakReminderPayload,
  buildRewardPayload,
  buildStreakMilestoneResult,
  getAntiCheatWarning,
} from "../notifications/session-notification-templates";

// ─── recovery-analysis ────────────────────────────────────────────────────────

import {
  evaluateRecovery,
  calculatePenalties,
  canProtectStreak,
  calculatePartialCredit,
  attemptSessionRecovery,
  canAutoRecoverForInterruption,
} from "../recovery/recovery-analysis";

// ─── persistence-resume ───────────────────────────────────────────────────────

import { isSessionStale, canResumeSession } from "../utils/persistence-resume";

// ─── enums ────────────────────────────────────────────────────────────────────

import {
  SessionStatusSchema,
  SessionPhaseSchema,
  ConflictStatusSchema,
  StorageStatusSchema,
  SyncStatusSchema,
  AntiCheatStatusSchema,
} from "../types/enums";

// ─────────────────────────────────────────────────────────────────────────────
// ID GENERATOR TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("idGenerator", () => {
  test("generateSessionId returns string starting with sess_", () => {
    const id = generateSessionId();
    expect(id).toMatch(/^sess_/);
  });

  test("generateSessionId produces unique IDs on consecutive calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateSessionId()));
    expect(ids.size).toBe(50);
  });

  test("generateShortId includes the given prefix", () => {
    const id = generateShortId("test");
    expect(id).toMatch(/^test_/);
  });

  test("generateUUID returns a valid UUID format", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test("IdGenerator object exports all functions", () => {
    expect(typeof IdGenerator.generateSessionId).toBe("function");
    expect(typeof IdGenerator.generateShortId).toBe("function");
    expect(typeof IdGenerator.generateUUID).toBe("function");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SESSION MODES TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("session modes", () => {
  test("SessionMode enum has all expected values", () => {
    expect(SessionMode.DEEP_WORK).toBe("DEEP_WORK");
    expect(SessionMode.CHALLENGE).toBe("CHALLENGE");
    expect(SessionMode.LIGHT_FOCUS).toBe("LIGHT_FOCUS");
    expect(SessionMode.FLOW).toBe("FLOW");
    expect(SessionMode.STUDY).toBe("STUDY");
    expect(SessionMode.CREATIVE).toBe("CREATIVE");
    expect(SessionMode.SPRINT).toBe("SPRINT");
    expect(SessionMode.RECOVERY).toBe("RECOVERY");
    expect(SessionMode.STARTER).toBe("STARTER");
  });

  test("resolveSessionMode returns valid modes and falls back to FLOW for invalid input", () => {
    expect(resolveSessionMode("DEEP_WORK")).toBe(SessionMode.DEEP_WORK);
    expect(resolveSessionMode("STUDY")).toBe(SessionMode.STUDY);
    expect(resolveSessionMode("INVALID_MODE")).toBe(SessionMode.FLOW);
    expect(resolveSessionMode(null)).toBe(SessionMode.FLOW);
    expect(resolveSessionMode(undefined)).toBe(SessionMode.FLOW);
  });

  test("getSessionModeConfig returns correct config for each mode", () => {
    const config = getSessionModeConfig("DEEP_WORK");
    expect(config.companionBehavior).toBe("intense");
    expect(config.blockerIntensityMultiplier).toBe(1.5);
    expect(config.purityPassThreshold).toBe(85);
    expect(config.xpMultiplier).toBe(1.2);
  });

  test("getSessionModeConfig falls back for invalid mode", () => {
    const config = getSessionModeConfig("INVALID");
    expect(config.companionBehavior).toBe("gentle"); // FLOW defaults
    expect(config.xpMultiplier).toBe(1);
  });

  test("every session mode has scoring weights summing close to 1", () => {
    for (const mode of Object.values(SessionMode)) {
      const config = SESSION_MODE_CONFIG[mode];
      const sum =
        config.scoringWeights.consistency +
        config.scoringWeights.depth +
        config.scoringWeights.recovery;
      expect(sum).toBeCloseTo(1.0, 5);
    }
  });

  test("getRecoveryChainMultiplier clamps chain count between 1 and 4", () => {
    expect(getRecoveryChainMultiplier(0)).toBe(1); // clamped to 1
    expect(getRecoveryChainMultiplier(1)).toBe(1);
    expect(getRecoveryChainMultiplier(2)).toBeCloseTo(1.05);
    expect(getRecoveryChainMultiplier(4)).toBeCloseTo(1.15);
    expect(getRecoveryChainMultiplier(10)).toBeCloseTo(1.15); // clamped to 4
  });

  test("getSprintChainMultiplier delegates to getRecoveryChainMultiplier", () => {
    expect(getSprintChainMultiplier(3)).toBe(getRecoveryChainMultiplier(3));
  });

  test("STARTER mode has lowest blocker intensity and lowest purity threshold", () => {
    const starter = SESSION_MODE_CONFIG[SessionMode.STARTER];
    for (const mode of Object.values(SessionMode)) {
      const config = SESSION_MODE_CONFIG[mode];
      expect(starter.blockerIntensityMultiplier).toBeLessThanOrEqual(
        config.blockerIntensityMultiplier,
      );
      expect(starter.purityPassThreshold).toBeLessThanOrEqual(
        config.purityPassThreshold,
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

const validConfig = {
  duration: 1500,
  intervals: 3,
  breakDuration: 300,
  strictMode: false,
  dndEnabled: false,
  autoStartBreaks: false,
  tags: ["work"],
  name: "Test Session",
};

describe("validateSessionConfig", () => {
  test("passes with valid config", () => {
    const result = validateSessionConfig(validConfig);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
  });

  test("fails when duration is too short", () => {
    const result = validateSessionConfig({ ...validConfig, duration: 30 });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("fails when duration exceeds 24 hours", () => {
    const result = validateSessionConfig({ ...validConfig, duration: 90000 });
    expect(result.success).toBe(false);
  });

  test("produces warning for long session without breaks", () => {
    const result = validateSessionConfig({
      ...validConfig,
      duration: 9000,
      breakDuration: 0,
    });
    expect(result.success).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "LONG_SESSION_NO_BREAK" }),
      ]),
    );
  });

  test("produces warning for strict mode without DND", () => {
    const result = validateSessionConfig({
      ...validConfig,
      strictMode: true,
      dndEnabled: false,
    });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "STRICT_WITHOUT_DND" }),
      ]),
    );
  });
});

describe("validateSessionStart", () => {
  test("fails for unauthenticated user", () => {
    const result = validateSessionStart(validConfig, {
      isAuthenticated: false,
      hasActiveSession: false,
      networkStatus: "online",
      dailySessionCount: 0,
    });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "NOT_AUTHENTICATED" }),
      ]),
    );
  });

  test("fails when user already has active session", () => {
    const result = validateSessionStart(validConfig, {
      isAuthenticated: true,
      hasActiveSession: true,
      networkStatus: "online",
      dailySessionCount: 0,
    });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "ACTIVE_SESSION_EXISTS" }),
      ]),
    );
  });

  test("warns about offline mode", () => {
    const result = validateSessionStart(validConfig, {
      isAuthenticated: true,
      hasActiveSession: false,
      networkStatus: "offline",
      dailySessionCount: 0,
    });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "OFFLINE_MODE" }),
      ]),
    );
  });
});

describe("validateSessionPause", () => {
  test("succeeds for ACTIVE session", () => {
    const result = validateSessionPause({
      status: "ACTIVE",
      elapsedTime: 300,
      pauseCount: 0,
      strictMode: false,
    });
    expect(result.success).toBe(true);
  });

  test("fails for non-ACTIVE session", () => {
    const result = validateSessionPause({
      status: "PAUSED",
      elapsedTime: 300,
      pauseCount: 0,
      strictMode: false,
    });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "INVALID_STATUS_FOR_PAUSE" }),
      ]),
    );
  });

  test("warns about excessive pauses", () => {
    const result = validateSessionPause({
      status: "ACTIVE",
      elapsedTime: 600,
      pauseCount: 6,
      strictMode: false,
    });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "EXCESSIVE_PAUSES" }),
      ]),
    );
  });
});

describe("validateSessionCompletion", () => {
  test("recommends abandon for minimal completion", () => {
    const result = validateSessionCompletion({
      elapsedTime: 30,
      duration: 1500,
      completionPercentage: 2,
      interruptions: 0,
      anticheatFlags: 0,
    });
    expect(result.data?.canComplete).toBe(false);
    expect(result.data?.recommendedAction).toBe("abandon");
  });

  test("recommends review for high interruptions", () => {
    const result = validateSessionCompletion({
      elapsedTime: 1500,
      duration: 1500,
      completionPercentage: 80,
      interruptions: 15,
      anticheatFlags: 0,
    });
    expect(result.data?.recommendedAction).toBe("review");
  });

  test("recommends complete for a clean session", () => {
    const result = validateSessionCompletion({
      elapsedTime: 1500,
      duration: 1500,
      completionPercentage: 100,
      interruptions: 0,
      anticheatFlags: 0,
    });
    expect(result.data?.canComplete).toBe(true);
    expect(result.data?.recommendedAction).toBe("complete");
  });
});

describe("formatValidationErrors / hasErrors / hasWarnings / getFirstError", () => {
  test("formatValidationErrors joins fields and messages", () => {
    const formatted = formatValidationErrors([
      { field: "duration", message: "Too short", code: "DURATION" },
      { field: "name", message: "Required", code: "NAME" },
    ]);
    expect(formatted).toBe("duration: Too short; name: Required");
  });

  test("hasErrors returns true when result has errors", () => {
    expect(
      hasErrors({ success: false, errors: [{ field: "x", message: "m", code: "c" }], warnings: [] }),
    ).toBe(true);
    expect(hasErrors({ success: true, errors: [], warnings: [] })).toBe(false);
  });

  test("hasWarnings returns true when warnings exist", () => {
    expect(
      hasWarnings({ success: true, errors: [], warnings: [{ field: "x", message: "m", code: "c" }] }),
    ).toBe(true);
  });

  test("getFirstError returns first error or null", () => {
    const err = { field: "a", message: "b", code: "c" };
    expect(getFirstError({ success: false, errors: [err], warnings: [] })).toBe(err);
    expect(getFirstError({ success: true, errors: [], warnings: [] })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FIELD VALIDATORS TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("FieldValidators", () => {
  test("duration returns null for valid value", () => {
    expect(FieldValidators.duration(1500)).toBeNull();
  });

  test("duration returns error for too-short value", () => {
    const err = FieldValidators.duration(10);
    expect(err).not.toBeNull();
    expect(err?.code).toBe("DURATION_TOO_SHORT");
  });

  test("duration returns error for too-long value", () => {
    const err = FieldValidators.duration(100000);
    expect(err?.code).toBe("DURATION_TOO_LONG");
  });

  test("name returns null for valid string", () => {
    expect(FieldValidators.name("Focus time")).toBeNull();
  });

  test("name returns error for empty string", () => {
    expect(FieldValidators.name("")?.code).toBe("NAME_REQUIRED");
  });

  test("name returns error for too-long string", () => {
    expect(FieldValidators.name("a".repeat(101))?.code).toBe("NAME_TOO_LONG");
  });

  test("intervals validates count and duration ratio", () => {
    expect(FieldValidators.intervals(3, 1500)).toBeNull();
    expect(FieldValidators.intervals(0, 1500)?.code).toBe("INTERVALS_TOO_FEW");
    expect(FieldValidators.intervals(25, 1500)?.code).toBe("INTERVALS_TOO_MANY");
    expect(FieldValidators.intervals(10, 300)?.code).toBe("INTERVALS_TOO_SHORT");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RETRY STRATEGY TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("RetryStrategy", () => {
  let strategy: RetryStrategy;

  beforeEach(() => {
    strategy = new RetryStrategy({ maxAttempts: 3, baseDelay: 10, maxDelay: 100, jitterFactor: 0 });
  });

  test("returns result on first success", async () => {
    const result = await strategy.execute(async () => "ok", "test-op");
    expect(result).toBe("ok");
  });

  test("retries on retryable error and eventually succeeds", async () => {
    let callCount = 0;
    const result = await strategy.execute(async () => {
      callCount++;
      if (callCount < 3) throw new Error("NETWORK_ERROR timeout");
      return "recovered";
    }, "retry-op");
    expect(result).toBe("recovered");
    expect(callCount).toBe(3);
  });

  test("throws AggregateError after max attempts exhausted", async () => {
    await expect(
      strategy.execute(async () => {
        throw new Error("NETWORK_ERROR");
      }, "fail-op"),
    ).rejects.toThrow(AggregateError);
  });

  test("throws immediately for non-retryable errors", async () => {
    await expect(
      strategy.execute(async () => {
        throw new Error("VALIDATION_ERROR");
      }, "non-retry"),
    ).rejects.toThrow("VALIDATION_ERROR");
  });

  test("executeWithFallback uses fallback when operation fails", async () => {
    const result = await strategy.executeWithFallback(
      async () => {
        throw new Error("NETWORK_ERROR timeout");
      },
      async () => "fallback-value",
      "fallback-op",
    );
    expect(result).toBe("fallback-value");
  });

  test("circuit breaker opens after threshold failures", async () => {
    const breakerStrategy = new RetryStrategy({
      maxAttempts: 1,
      baseDelay: 1,
      maxDelay: 10,
      jitterFactor: 0,
      circuitBreakerThreshold: 2,
      circuitBreakerResetTime: 60000,
    });

    // Fail twice to trip the breaker
    for (let i = 0; i < 2; i++) {
      try {
        await breakerStrategy.execute(async () => {
          throw new Error("NETWORK_ERROR");
        }, "breaker-test");
      } catch {
        // expected
      }
    }

    // Third call should fail immediately with circuit breaker open
    await expect(
      breakerStrategy.execute(async () => "ok", "breaker-test"),
    ).rejects.toThrow("Circuit breaker open");
  });

  test("resetCircuit clears circuit breaker state", async () => {
    const breakerStrategy = new RetryStrategy({
      maxAttempts: 1,
      baseDelay: 1,
      maxDelay: 10,
      jitterFactor: 0,
      circuitBreakerThreshold: 1,
      circuitBreakerResetTime: 60000,
    });

    try {
      await breakerStrategy.execute(async () => {
        throw new Error("NETWORK_ERROR");
      }, "reset-test");
    } catch {
      // expected
    }

    breakerStrategy.resetCircuit("reset-test");
    const result = await breakerStrategy.execute(async () => "ok", "reset-test");
    expect(result).toBe("ok");
  });
});

describe("retry-factories", () => {
  test("createRetryStrategy returns a RetryStrategy instance", () => {
    const strategy = createRetryStrategy();
    expect(strategy).toBeInstanceOf(RetryStrategy);
  });

  test("getRetryStrategy returns same instance on repeated calls", () => {
    const a = getRetryStrategy();
    const b = getRetryStrategy();
    expect(a).toBe(b);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION TEMPLATES TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("session-notification-templates", () => {
  test("buildInterruptionPayload returns correct severity titles", () => {
    expect(buildInterruptionPayload("s1", "CRITICAL").priority).toBe("high");
    expect(buildInterruptionPayload("s1", "MAJOR").title).toContain("Interruption");
    expect(buildInterruptionPayload("s1", "MINOR").title).toBe("Session Paused");
  });

  test("buildRecoveryPayload includes minutes elapsed", () => {
    const payload = buildRecoveryPayload("s1", 15);
    expect(payload.body).toContain("15");
    expect(payload.data.type).toBe("recovery_reminder");
  });

  test("buildStreakWarningPayload includes streak days and hours", () => {
    const payload = buildStreakWarningPayload(7, 3);
    expect(payload.body).toContain("7");
    expect(payload.body).toContain("3");
    expect(payload.priority).toBe("high");
  });

  test("buildDailyReminderPayload returns standard reminder", () => {
    const payload = buildDailyReminderPayload();
    expect(payload.data.type).toBe("daily_reminder");
    expect(payload.priority).toBe("normal");
  });

  test("buildBreakReminderPayload includes break duration", () => {
    const payload = buildBreakReminderPayload(300);
    expect(payload.body).toContain("5");
  });

  test("buildRewardPayload returns null when all rewards are zero", () => {
    expect(buildRewardPayload(0, 0, 0)).toBeNull();
  });

  test("buildRewardPayload includes all non-zero rewards", () => {
    const payload = buildRewardPayload(100, 50, 3);
    expect(payload).not.toBeNull();
    expect(payload!.body).toContain("100 XP");
    expect(payload!.body).toContain("50 coins");
    expect(payload!.body).toContain("3 gems");
  });

  test("buildStreakMilestoneResult returns special messages for 7, 30, 100 days", () => {
    expect(buildStreakMilestoneResult(7).title).toContain("Week");
    expect(buildStreakMilestoneResult(30).title).toContain("Month");
    expect(buildStreakMilestoneResult(100).title).toContain("Century");
    expect(buildStreakMilestoneResult(3).title).toContain("Streak");
  });

  test("getAntiCheatWarning returns known violation warnings", () => {
    expect(getAntiCheatWarning("TIME_MANIPULATION").title).toContain("Time");
    expect(getAntiCheatWarning("DEVICE_CHANGE").title).toContain("Device");
    expect(getAntiCheatWarning("RAPID_COMPLETION").title).toContain("Suspicious");
  });

  test("getAntiCheatWarning returns generic for unknown violation", () => {
    expect(getAntiCheatWarning("UNKNOWN_THING").title).toContain("Warning");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY ANALYSIS TESTS
// ─────────────────────────────────────────────────────────────────────────────

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    config: { duration: 1500 },
    baseScore: 100,
    completionPercentage: 60,
    effectiveTime: 1200,
    recoveryAttempts: 0,
    lastRecoveryAt: 0,
    damagePoints: 0,
    ...overrides,
  } as Parameters<typeof evaluateRecovery>[0];
}

describe("recovery-analysis", () => {
  test("evaluateRecovery: AUTO_RESUME succeeds with low penalties", () => {
    expect(evaluateRecovery(makeSession(), "AUTO_RESUME", [{ amount: 1 }], 0.3)).toBe(true);
  });

  test("evaluateRecovery: AUTO_RESUME fails with high penalties", () => {
    expect(evaluateRecovery(makeSession(), "AUTO_RESUME", [{ amount: 20 }], 0.3)).toBe(false);
  });

  test("evaluateRecovery: FULL_RESET always succeeds", () => {
    expect(evaluateRecovery(makeSession(), "FULL_RESET", [], 0.3)).toBe(true);
  });

  test("evaluateRecovery: STREAK_SAVE succeeds with sufficient completion", () => {
    expect(
      evaluateRecovery(makeSession({ completionPercentage: 50 }), "STREAK_SAVE", [], 0.3),
    ).toBe(true);
  });

  test("calculatePenalties returns correct penalties per recovery type", () => {
    const session = makeSession();
    expect(calculatePenalties(session, "AUTO_RESUME")).toHaveLength(1);
    expect(calculatePenalties(session, "USER_RESUME")).toHaveLength(1);
    expect(calculatePenalties(session, "STREAK_SAVE")).toHaveLength(2);
    expect(calculatePenalties(session, "FULL_RESET")).toHaveLength(1);
    expect(calculatePenalties(session, "PARTIAL_CREDIT")).toHaveLength(2);
  });

  test("calculatePenalties adds recovery streak penalty for multiple attempts", () => {
    const session = makeSession({ recoveryAttempts: 2 });
    const penalties = calculatePenalties(session, "AUTO_RESUME");
    expect(penalties.length).toBeGreaterThan(1);
    expect(penalties.some((p) => p.type === "RECOVERY_STREAK_PENALTY")).toBe(true);
  });

  test("canProtectStreak returns STREAK_FREEZE for >= 50% completion", () => {
    const result = canProtectStreak(makeSession({ completionPercentage: 60 }), true, 0.3);
    expect(result.canProtect).toBe(true);
    expect(result.protectionType).toBe("STREAK_FREEZE");
  });

  test("canProtectStreak returns false when disabled", () => {
    expect(canProtectStreak(makeSession(), false, 0.3).canProtect).toBe(false);
  });

  test("calculatePartialCredit returns eligible with multiplier for >= 50% completion", () => {
    const result = calculatePartialCredit(makeSession({ completionPercentage: 70 }), 0.3);
    expect(result.eligible).toBe(true);
    expect(result.scoreMultiplier).toBe(0.5);
  });

  test("calculatePartialCredit returns not eligible for very low completion", () => {
    const result = calculatePartialCredit(makeSession({ completionPercentage: 5 }), 0.3);
    expect(result.eligible).toBe(false);
  });

  test("attemptSessionRecovery builds a valid RecoveryRecord", () => {
    const session = makeSession();
    const recovery = attemptSessionRecovery(session, "USER_RESUME", 0.3);
    expect(recovery.type).toBe("USER_RESUME");
    expect(recovery.sessionId).toBe("session-1");
    expect(recovery.penalties.length).toBeGreaterThan(0);
  });

  test("canAutoRecoverForInterruption allows MINOR always", () => {
    expect(canAutoRecoverForInterruption(0, 3, "MINOR")).toBe(true);
  });

  test("canAutoRecoverForInterruption blocks SEVERE always", () => {
    expect(canAutoRecoverForInterruption(0, 3, "SEVERE")).toBe(false);
  });

  test("canAutoRecoverForInterruption respects max recoveries for MODERATE", () => {
    expect(canAutoRecoverForInterruption(3, 3, "MODERATE")).toBe(false);
    expect(canAutoRecoverForInterruption(1, 3, "MODERATE")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCE RESUME TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("persistence-resume", () => {
  test("isSessionStale returns true for old session", () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    expect(isSessionStale(twoDaysAgo)).toBe(true);
  });

  test("isSessionStale returns false for recent session", () => {
    expect(isSessionStale(Date.now())).toBe(false);
  });

  test("canResumeSession rejects sessions older than 24 hours", () => {
    const oldState = { lastUpdatedAt: Date.now() - 25 * 60 * 60 * 1000, status: "ACTIVE", interruptions: 0, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(oldState);
    expect(result.canResume).toBe(false);
    expect(result.risk).toBe("HIGH");
  });

  test("canResumeSession rejects non-resumable statuses", () => {
    const state = { lastUpdatedAt: Date.now(), status: "COMPLETED", interruptions: 0, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(state);
    expect(result.canResume).toBe(false);
    expect(result.risk).toBe("NONE");
  });

  test("canResumeSession allows resumption for ACTIVE session with no issues", () => {
    const state = { lastUpdatedAt: Date.now(), status: "ACTIVE", interruptions: 0, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(state);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe("NONE");
  });

  test("canResumeSession flags MEDIUM risk for high interruptions", () => {
    const state = { lastUpdatedAt: Date.now(), status: "ACTIVE", interruptions: 15, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(state);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe("MEDIUM");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ENUM SCHEMA TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("session enum schemas", () => {
  test("SessionStatusSchema accepts all valid statuses", () => {
    const statuses = [
      "PREPARING", "STARTING", "ACTIVE", "PAUSED", "BACKGROUNDED",
      "COMPLETING", "COMPLETED", "PARTIAL", "ABANDONED", "FAILED",
    ];
    for (const status of statuses) {
      expect(() => SessionStatusSchema.parse(status)).not.toThrow();
    }
  });

  test("SessionStatusSchema rejects invalid status", () => {
    expect(() => SessionStatusSchema.parse("INVALID")).toThrow();
  });

  test("SessionPhaseSchema accepts valid phases", () => {
    for (const phase of ["FOCUS", "SHORT_BREAK", "LONG_BREAK", "PREPARATION", "REVIEW"]) {
      expect(() => SessionPhaseSchema.parse(phase)).not.toThrow();
    }
  });

  test("ConflictStatusSchema accepts valid statuses", () => {
    expect(() => ConflictStatusSchema.parse("NONE")).not.toThrow();
    expect(() => ConflictStatusSchema.parse("RESOLVED_LOCAL")).not.toThrow();
  });

  test("AntiCheatStatusSchema accepts valid statuses", () => {
    expect(() => AntiCheatStatusSchema.parse("CLEAN")).not.toThrow();
    expect(() => AntiCheatStatusSchema.parse("FLAGGED")).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SessionValidation namespace
// ─────────────────────────────────────────────────────────────────────────────

describe("SessionValidation namespace", () => {
  test("exposes all validation functions", () => {
    expect(typeof SessionValidation.validateConfig).toBe("function");
    expect(typeof SessionValidation.validateStart).toBe("function");
    expect(typeof SessionValidation.validatePause).toBe("function");
    expect(typeof SessionValidation.validateCompletion).toBe("function");
    expect(typeof SessionValidation.formatErrors).toBe("function");
    expect(typeof SessionValidation.hasErrors).toBe("function");
    expect(typeof SessionValidation.hasWarnings).toBe("function");
    expect(typeof SessionValidation.getFirstError).toBe("function");
  });
});
