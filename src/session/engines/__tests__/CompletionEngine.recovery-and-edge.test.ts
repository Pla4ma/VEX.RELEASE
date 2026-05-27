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

  it("should attempt to recover abandoned session", () => {
    const session = createMockSession({
      status: "ABANDONED",
      completionPercentage: 75,
    });
    const result = completionEngine.attemptRecovery(session, 5);
    expect(result.success).toBe(true);
  });

  it("should change status to RECOVERED on success", () => {
    const session = createMockSession({
      status: "ABANDONED",
      completionPercentage: 75,
    });
    completionEngine.attemptRecovery(session, 5);
    expect(session.status).toBe("RECOVERED");
  });

  it("should fail recovery for low completion percentages", () => {
    const session = createMockSession({
      status: "ABANDONED",
      completionPercentage: 30,
    });
    const result = completionEngine.attemptRecovery(session, 5);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should fail recovery for already completed sessions", () => {
    const session = createMockSession({
      status: "COMPLETED",
      completionPercentage: 100,
    });
    const result = completionEngine.attemptRecovery(session, 5);
    expect(result.success).toBe(false);
  });
});

describe("CompletionEngine > edge cases", () => {
  let completionEngine: ReturnType<typeof createEngines>["completionEngine"];

  beforeEach(() => {
    ({ completionEngine } = createEngines());
  });

  it("should handle zero completion percentage", () => {
    const session = createMockSession({ completionPercentage: 0 });
    const abandonResult = completionEngine.abandonSession(session, 5);
    expect(abandonResult.partialCredit).toBe(false);
    expect(abandonResult.canRecover).toBe(false);
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
