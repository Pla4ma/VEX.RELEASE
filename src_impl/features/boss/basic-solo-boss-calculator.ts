/**
 * Basic Solo Boss Calculator
 *
 * Deterministic damage calculation for solo boss encounters.
 */

export interface CalculateDamageInput {
  sessionDurationMinutes: number;
  sessionQuality: number;
  streakDays: number;
}

/**
 * Calculates damage based on session performance and streak.
 *
 * Formula:
 * - baseDamage = sessionDurationMinutes * 0.8 (min 1)
 * - qualityMultiplier = sessionQuality / 100 (min 0.5)
 * - streakBonus = 1.2 if streak >= 3, else 1.0
 */
export function calculateBasicSoloBossDamage(input: CalculateDamageInput): number {
  const { sessionDurationMinutes, sessionQuality, streakDays } = input;

  // Simple deterministic formula
  const baseDamage = Math.max(1, Math.round(sessionDurationMinutes * 0.8));
  const qualityMultiplier = Math.max(0.5, sessionQuality / 100);
  const streakBonus = streakDays >= 3 ? 1.2 : 1.0;

  return Math.round(baseDamage * qualityMultiplier * streakBonus);
}
