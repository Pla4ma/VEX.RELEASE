import type { SessionState, DamageCalculation } from "../types";

const BASE_SCORE_PER_MINUTE = 25;

export function calculateDamage(
  session: SessionState,
  userStreak: number,
  reason: "ABANDON" | "INTERRUPTION" | "TIMEOUT" | "ANTI_CHEAT",
): DamageCalculation {
  const baseDamage = session.baseScore * 0.1;
  let pauseDamage = 0;
  let interruptionDamage = 0;
  let abandonDamage = 0;
  let antiCheatDamage = 0;

  switch (reason) {
    case "ABANDON":
      abandonDamage = baseDamage * 3;
      pauseDamage = session.pauses * 2;
      interruptionDamage = session.interruptions * 5;
      break;
    case "INTERRUPTION":
      interruptionDamage = baseDamage * 2;
      pauseDamage = session.pauses;
      break;
    case "TIMEOUT":
      abandonDamage = baseDamage * 2;
      pauseDamage = session.pauses * 1.5;
      break;
    case "ANTI_CHEAT":
      antiCheatDamage = baseDamage * 5;
      break;
  }

  const streakProtection = userStreak > 7;
  const mitigation = streakProtection ? 0.5 : 0;
  const totalDamage =
    (baseDamage +
      pauseDamage +
      interruptionDamage +
      abandonDamage +
      antiCheatDamage) *
    (1 - mitigation);
  const finalPenalty = Math.min(1, totalDamage / (session.baseScore || 1));

  return {
    baseDamage,
    pauseDamage,
    interruptionDamage,
    abandonDamage,
    antiCheatDamage,
    mitigation,
    streakProtection,
    totalDamage,
    finalPenalty,
  };
}
