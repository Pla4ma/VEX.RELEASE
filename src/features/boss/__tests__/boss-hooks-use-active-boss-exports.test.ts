import { useActiveBossEnhanced } from "../hooks/useActiveBoss";
import type {
  ActiveBossState,
  DamageCalculation,
  KillEstimate,
} from "../hooks/useActiveBoss";

describe("hooks/useActiveBoss exports", () => {
  it("useActiveBossEnhanced is a function", () => {
    expect(typeof useActiveBossEnhanced).toBe("function");
  });

  it("ActiveBossState type is null", () => {
    const state: ActiveBossState = null;
    expect(state).toBeNull();
  });

  it("DamageCalculation has damage number", () => {
    const calc: DamageCalculation = { damage: 10 };
    expect(calc.damage).toBe(10);
  });

  it("KillEstimate has sessionsRemaining number", () => {
    const estimate: KillEstimate = { sessionsRemaining: 3 };
    expect(estimate.sessionsRemaining).toBe(3);
  });
});
