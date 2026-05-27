import {
  createMockSession,
  createMockMetrics,
  createEngines,
} from "./CompletionEngine.helpers";

describe("CompletionEngine > handlePartialCompletion", () => {
  let completionEngine: ReturnType<typeof createEngines>["completionEngine"];

  beforeEach(() => {
    ({ completionEngine } = createEngines());
  });

  it("should handle partial completion", () => {
    const session = createMockSession({ completionPercentage: 70 });
    const metrics = createMockMetrics();
    const result = completionEngine.handlePartialCompletion(
      session,
      metrics,
      5,
    );
    expect(result.success).toBe(true);
    expect(result.status).toBe("PARTIAL");
  });

  it("should set session status to PARTIAL", () => {
    const session = createMockSession({ completionPercentage: 70 });
    const metrics = createMockMetrics();
    completionEngine.handlePartialCompletion(session, metrics, 5);
    expect(session.status).toBe("PARTIAL");
  });

  it("should grant partial rewards", () => {
    const session = createMockSession({ completionPercentage: 70 });
    const metrics = createMockMetrics();
    const result = completionEngine.handlePartialCompletion(
      session,
      metrics,
      5,
    );
    expect(result.rewardsGranted).toBe(true);
  });

  it("should maintain streak for partial completion above threshold", () => {
    const session = createMockSession({ completionPercentage: 70 });
    const metrics = createMockMetrics();
    const result = completionEngine.handlePartialCompletion(
      session,
      metrics,
      5,
    );
    expect(result.streakMaintained).toBe(true);
  });
});
