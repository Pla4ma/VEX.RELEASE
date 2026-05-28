import { calculateFocusScoreUpdate } from "../score-algorithm";
import { createInput } from "./score-algorithm.fixtures";

describe("focus score algorithm", () => {
  it("creates visible movement for first session users", () => {
    const result = calculateFocusScoreUpdate(
      createInput({
        previousScore: 550,
        signals: {
          consistency: 52,
          streakStability: 50,
          sessionQuality: 54,
          intentionalDifficulty: 51,
          recency: 52,
        },
      }),
    );
    expect(result.delta).toBeGreaterThanOrEqual(4);
  });

  it("enforces floor and ceiling bounds", () => {
    const low = calculateFocusScoreUpdate(
      createInput({
        previousScore: 301,
        grade: "D",
        signals: {
          consistency: 0,
          streakStability: 0,
          sessionQuality: 0,
          intentionalDifficulty: 0,
          recency: 0,
        },
      }),
    );
    const high = calculateFocusScoreUpdate(
      createInput({
        previousScore: 849,
        grade: "S",
        signals: {
          consistency: 100,
          streakStability: 100,
          sessionQuality: 100,
          intentionalDifficulty: 100,
          recency: 100,
        },
      }),
    );
    expect(low.newScore).toBe(300);
    expect(high.newScore).toBe(850);
  });

  it("handles all grades from S through D", () => {
    const s = calculateFocusScoreUpdate(createInput({ grade: "S" }));
    const a = calculateFocusScoreUpdate(createInput({ grade: "A" }));
    const b = calculateFocusScoreUpdate(createInput({ grade: "B" }));
    const c = calculateFocusScoreUpdate(createInput({ grade: "C" }));
    const d = calculateFocusScoreUpdate(createInput({ grade: "D" }));
    expect(s.delta).toBeGreaterThan(a.delta);
    expect(a.delta).toBeGreaterThan(b.delta);
    expect(b.delta).toBeGreaterThan(c.delta);
    expect(c.delta).toBeGreaterThan(d.delta);
  });

  it("applies missed-day decay via streak update recency signal", () => {
    const result = calculateFocusScoreUpdate(
      createInput({
        eventType: "streak:updated",
        grade: undefined,
        sessionMode: undefined,
        signals: {
          consistency: 45,
          streakStability: 40,
          sessionQuality: 50,
          intentionalDifficulty: 45,
          recency: 20,
        },
      }),
    );
    expect(result.delta).toBeLessThan(0);
  });

  it("softens losses on comeback sessions", () => {
    const missed = calculateFocusScoreUpdate(
      createInput({
        eventType: "streak:updated",
        grade: undefined,
        sessionMode: undefined,
        signals: {
          consistency: 45,
          streakStability: 42,
          sessionQuality: 50,
          intentionalDifficulty: 45,
          recency: 25,
        },
      }),
    );
    const comeback = calculateFocusScoreUpdate(
      createInput({
        eventType: "comeback:completed",
        grade: "B",
        sessionMode: "recovery",
        signals: {
          consistency: 52,
          streakStability: 50,
          sessionQuality: 62,
          intentionalDifficulty: 48,
          recency: 55,
        },
      }),
    );
    expect(comeback.delta).toBeGreaterThan(missed.delta);
  });

  it("prevents recovery farming and caps recovery multipliers", () => {
    const result = calculateFocusScoreUpdate(
      createInput({
        grade: "S",
        sessionMode: "recovery",
        signals: {
          consistency: 100,
          streakStability: 100,
          sessionQuality: 100,
          intentionalDifficulty: 100,
          recency: 100,
        },
      }),
    );
    expect(result.delta).toBeLessThanOrEqual(8);
    expect(result.xpQualityMultiplier).toBeLessThanOrEqual(1.05);
  });

  it("penalizes abandoned sessions", () => {
    const result = calculateFocusScoreUpdate(
      createInput({
        eventType: "session:abandoned",
        grade: undefined,
        sessionMode: undefined,
        signals: {
          consistency: 50,
          streakStability: 50,
          sessionQuality: 40,
          intentionalDifficulty: 50,
          recency: 50,
        },
      }),
    );
    expect(result.delta).toBeLessThan(0);
    expect(result.xpQualityMultiplier).toBe(0.5);
  });

  it("includes top positive and top negative factor explanations", () => {
    const result = calculateFocusScoreUpdate(createInput());
    expect(result.explanations[0]).toContain("Top positive factor");
    expect(result.explanations[1]).toContain("Top negative factor");
  });

  it("keeps factor weights at 100 with contract completion included", () => {
    const result = calculateFocusScoreUpdate(
      createInput({ completedContractCount: 3, contractCompletionRate: 1 }),
    );
    const total = Object.values(result.factors).reduce(
      (sum, factor) => sum + factor.weightPercent,
      0,
    );
    expect(total).toBe(100);
    expect(result.factors.contractCompletion.score).toBe(100);
    expect(result.newScore).toBeGreaterThanOrEqual(300);
    expect(result.newScore).toBeLessThanOrEqual(850);
  });

  it("does not penalize users with no contracts", () => {
    const result = calculateFocusScoreUpdate(
      createInput({ completedContractCount: 0, contractCompletionRate: 0 }),
    );
    expect(result.factors.contractCompletion.score).toBe(50);
  });

  it("penalizes missed contracts only after enough contract history exists", () => {
    const noHistory = calculateFocusScoreUpdate(
      createInput({ completedContractCount: 0, contractCompletionRate: 0 }),
    );
    const enoughHistory = calculateFocusScoreUpdate(
      createInput({ completedContractCount: 3, contractCompletionRate: 0 }),
    );
    expect(enoughHistory.delta).toBeLessThan(noHistory.delta);
  });
});
