import {
  createMockSession,
  createMockMetrics,
  createEngines,
} from "./CompletionEngine.helpers";

describe("CompletionEngine > attemptRecovery", () => {
  let completionEngine: ReturnType<typeof createEngines>["completionEngine"];

  beforeEach(() => {
    ({ completionEngine } = createEngines());
  });

  it("should successfully recover with USER_RESUME", () => {
    const session = createMockSession({
      status: "ABANDONED",
      completionPercentage: 75,
    });
    const metrics = createMockMetrics();
    const result = completionEngine.attemptRecovery(
      session,
      "USER_RESUME",
      metrics,
      5,
    );
    expect(result.success).toBe(true);
  });

  it("should set status to ACTIVE on USER_RESUME", () => {
    const session = createMockSession({
      status: "ABANDONED",
      completionPercentage: 75,
    });
    const metrics = createMockMetrics();
    completionEngine.attemptRecovery(session, "USER_RESUME", metrics, 5);
    expect(session.status).toBe("ACTIVE");
  });

  it("should fail STREAK_SAVE for low completion percentages", () => {
    const session = createMockSession({
      status: "ABANDONED",
      completionPercentage: 20,
    });
    const metrics = createMockMetrics();
    const result = completionEngine.attemptRecovery(
      session,
      "STREAK_SAVE",
      metrics,
      5,
    );
    expect(result.success).toBe(false);
  });

  it("should succeed PARTIAL_CREDIT regardless of session state", () => {
    const session = createMockSession({
      status: "COMPLETED",
      completionPercentage: 100,
    });
    const metrics = createMockMetrics();
    const result = completionEngine.attemptRecovery(
      session,
      "PARTIAL_CREDIT",
      metrics,
      5,
    );
    expect(result.success).toBe(true);
  });
});

describe("CompletionEngine > edge cases", () => {
  let completionEngine: ReturnType<typeof createEngines>["completionEngine"];

  beforeEach(() => {
    ({ completionEngine } = createEngines());
  });

  it("should handle zero completion percentage", () => {
    const session = createMockSession({ completionPercentage: 0 });
    const abandonResult = completionEngine.abandonSession(session);
    expect(abandonResult.partialCredit).toBe(false);
    expect(abandonResult.canRecover).toBe(true);
  });

  it("should handle session with many pauses", () => {
    const session = createMockSession({ pauses: 20 });
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.success).toBe(true);
  });

  it("should handle session with many interruptions", () => {
    const session = createMockSession({ interruptions: 15 });
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.success).toBe(true);
  });

  it("should handle very short sessions", () => {
    const session = createMockSession({
      config: { ...createMockSession().config, duration: 60 },
      completionPercentage: 100,
    });
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.success).toBe(true);
  });

  it("should handle very long sessions", () => {
    const session = createMockSession({
      config: { ...createMockSession().config, duration: 7200 },
      completionPercentage: 100,
    });
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.success).toBe(true);
  });
});
