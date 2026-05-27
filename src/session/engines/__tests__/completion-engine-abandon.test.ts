import { createMockSession, createMockMetrics, createEngines } from "./helpers";

describe("CompletionEngine — abandonSession", () => {
  let completionEngine: ReturnType<typeof createEngines>["completionEngine"];

  beforeEach(() => {
    completionEngine = createEngines().completionEngine;
  });

  it("should handle session abandonment", () => {
    const session = createMockSession({ completionPercentage: 30 });
    const result = completionEngine.abandonSession(session, 5);
    expect(result.sessionId).toBe("test-session");
    expect(result.canRecover).toBeDefined();
  });

  it("should set session status to ABANDONED", () => {
    const session = createMockSession();
    completionEngine.abandonSession(session, 5);
    expect(session.status).toBe("ABANDONED");
  });

  it("should set endedAt timestamp", () => {
    const session = createMockSession();
    completionEngine.abandonSession(session, 5);
    expect(session.endedAt).toBeDefined();
    expect(session.endedAt).toBeGreaterThan(0);
  });

  it("should calculate damage for abandonment", () => {
    const session = createMockSession();
    const result = completionEngine.abandonSession(session, 5);
    expect(result.damage).toBeDefined();
    expect(result.damage.baseDamage).toBeGreaterThan(0);
  });

  it("should indicate streak is broken on abandon", () => {
    const session = createMockSession();
    const result = completionEngine.abandonSession(session, 5);
    expect(result.streakBroken).toBe(true);
  });

  it("should provide partial credit based on completion percentage", () => {
    const highCompletion = createMockSession({ completionPercentage: 80 });
    const lowCompletion = createMockSession({ completionPercentage: 20 });
    const highResult = completionEngine.abandonSession(highCompletion, 5);
    const lowResult = completionEngine.abandonSession(lowCompletion, 5);
    expect(highResult.partialCredit).toBe(true);
    expect(lowResult.partialCredit).toBe(false);
  });

  it("should allow recovery for high completion percentages", () => {
    const session = createMockSession({ completionPercentage: 75 });
    const result = completionEngine.abandonSession(session, 5);
    expect(result.canRecover).toBe(true);
  });

  it("should not allow recovery for low completion percentages", () => {
    const session = createMockSession({ completionPercentage: 25 });
    const result = completionEngine.abandonSession(session, 5);
    expect(result.canRecover).toBe(false);
  });
});
