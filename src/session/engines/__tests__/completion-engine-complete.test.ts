import { createMockSession, createMockMetrics, createEngines } from "./helpers";

describe("CompletionEngine — completeSession", () => {
  let completionEngine: ReturnType<typeof createEngines>["completionEngine"];

  beforeEach(() => {
    completionEngine = createEngines().completionEngine;
  });

  it("should complete session successfully", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.success).toBe(true);
    expect(result.status).toBe("COMPLETED");
    expect(result.streakMaintained).toBe(true);
  });

  it("should set session status to COMPLETED", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    completionEngine.completeSession(session, metrics, 5);
    expect(session.status).toBe("COMPLETED");
  });

  it("should set completedAt timestamp", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    completionEngine.completeSession(session, metrics, 5);
    expect(session.completedAt).toBeDefined();
    expect(session.completedAt).toBeGreaterThan(0);
  });

  it("should set completion percentage to 100", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    completionEngine.completeSession(session, metrics, 5);
    expect(session.completionPercentage).toBe(100);
  });

  it("should include focus quality in session", () => {
    const session = createMockSession();
    const metrics = createMockMetrics({ overallScore: 92 });
    completionEngine.completeSession(session, metrics, 5);
    expect(session.focusQuality).toBe(92);
  });

  it("should calculate and store score", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    completionEngine.completeSession(session, metrics, 5);
    expect(session.baseScore).toBeGreaterThan(0);
  });

  it("should create session summary", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.summary).toBeDefined();
    expect(result.summary.sessionId).toBe("test-session");
    expect(result.summary.totalScore).toBeGreaterThan(0);
  });

  it("should include reflection in summary when provided", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    const reflection = "Great focus session today!";
    const result = completionEngine.completeSession(
      session,
      metrics,
      5,
      reflection,
    );
    expect(result.summary.reflection).toBe(reflection);
  });

  it("should include mood in summary when provided", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(
      session,
      metrics,
      5,
      undefined,
      "GREAT",
    );
    expect(result.summary.mood).toBe("GREAT");
  });

  it("should include tasks completed in summary when provided", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(
      session,
      metrics,
      5,
      undefined,
      undefined,
      3,
    );
    expect(result.summary.tasksCompleted).toBe(3);
  });

  it("should indicate rewards are granted", () => {
    const session = createMockSession();
    const metrics = createMockMetrics();
    const result = completionEngine.completeSession(session, metrics, 5);
    expect(result.rewardsGranted).toBe(true);
  });
});
