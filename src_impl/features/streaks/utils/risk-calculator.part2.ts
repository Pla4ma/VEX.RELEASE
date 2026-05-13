import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


function getRiskLevel(score: number, hoursSinceLastSession: number): RiskLevel {
  // Override based on hours elapsed
  if (hoursSinceLastSession >= CRITICAL_THRESHOLD || score >= 85) {
    return 'CRITICAL';
  }
  if (hoursSinceLastSession >= HIGH_THRESHOLD || score >= 65) {
    return 'HIGH';
  }
  if (hoursSinceLastSession >= MEDIUM_THRESHOLD || score >= 40) {
    return 'MEDIUM';
  }
  if (score >= 20) {
    return 'LOW';
  }
  return 'NONE';
}

export const StreakRiskCalculator = {
  calculate: calculateStreakRisk,
  getRiskLevel,
  analyzePattern,
};