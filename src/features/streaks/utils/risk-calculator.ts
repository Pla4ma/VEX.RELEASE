import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events/EventBus';
import type { RiskLevel, RiskFactors, RiskAssessment } from './riskTypes';
import { WEIGHTS, CRITICAL_THRESHOLD } from './riskTypes';
import {
  analyzePattern,
  calculateRecentQuality,
  getRiskLevel,
  getUrgency,
  getSuggestedAction,
  generateRecommendation,
} from './riskHelpers';

const debug = createDebugger('streaks:risk');

export function calculateStreakRisk(
  currentStreak: number,
  lastSessionAt: number,
  userPatterns: {
    typicalSessionHour: number;
    sessionHistory: { timestamp: number; quality: number }[];
    timezone: string;
  },
): RiskAssessment {
  const now = Date.now();
  const hoursSinceLastSession = (now - lastSessionAt) / (60 * 60 * 1000);
  const userTime = new Date(now).toLocaleString('en-US', {
    timeZone: userPatterns.timezone,
    hour: 'numeric',
    hour12: false,
  });
  const currentHour = parseInt(userTime, 10);
  const lastSessionDate = new Date(lastSessionAt);
  const nowDate = new Date(now);
  const daysDifference = Math.floor(
    (nowDate.getTime() - lastSessionDate.getTime()) /
      (24 * 60 * 60 * 1000),
  );
  const daysUntilBreak = Math.max(0, 1 - daysDifference);
  const historicalPattern = analyzePattern(userPatterns.sessionHistory);
  const recentQuality = calculateRecentQuality(userPatterns.sessionHistory);
  const userDay = new Date(now).toLocaleString('en-US', {
    timeZone: userPatterns.timezone,
    weekday: 'short',
  });
  const weekendRisk = ['Sat', 'Sun'].some((day) => userDay.includes(day));
  const factors: RiskFactors = {
    hoursSinceLastSession,
    typicalSessionHour: userPatterns.typicalSessionHour,
    currentHour,
    historicalPattern,
    daysUntilStreakBreak: daysUntilBreak,
    recentSessionQuality: recentQuality,
    weekendRisk,
    vacationMode: false,
  };

  let score = 0;
  const timeDrift = Math.abs(currentHour - userPatterns.typicalSessionHour);
  const normalizedDrift = Math.min(timeDrift / 12, 1);
  score += normalizedDrift * WEIGHTS.TIME_DRIFT * 100;
  const hoursFactor = Math.min(hoursSinceLastSession / CRITICAL_THRESHOLD, 1);
  score += hoursFactor * WEIGHTS.HOURS_ELAPSED * 100;

  if (historicalPattern === 'DECLINING') {
    score += WEIGHTS.PATTERN_DECLINE * 100;
  } else if (historicalPattern === 'VARIABLE') {
    score += WEIGHTS.PATTERN_DECLINE * 100 * 0.5;
  }
  if (recentQuality < 50) {
    score += WEIGHTS.QUALITY_DROP * 100;
  } else if (recentQuality < 70) {
    score += WEIGHTS.QUALITY_DROP * 100 * 0.5;
  }
  if (weekendRisk) {
    score += WEIGHTS.WEEKEND_FACTOR * 100;
  }
  score = Math.min(Math.round(score), 100);

  const level = getRiskLevel(score, hoursSinceLastSession);
  const urgency = getUrgency(level, hoursSinceLastSession, daysUntilBreak);
  const suggestedAction = getSuggestedAction(level, urgency);
  const recommendation = generateRecommendation(level, factors);
  const assessment: RiskAssessment = {
    level,
    score,
    factors,
    recommendation,
    urgency,
    suggestedAction,
  };

  debug.info('Streak risk calculated', {
    currentStreak,
    score,
    level,
    hoursSinceLastSession: hoursSinceLastSession.toFixed(1),
  });
  if (level === 'HIGH' || level === 'CRITICAL') {
    eventBus.publish('analytics:track', {
      event: 'streak_risk_alert',
      properties: {
        currentStreak,
        riskScore: score,
        riskLevel: level,
        hoursSinceLastSession,
      },
    });
  }
  return assessment;
}

export { getRiskLevel, analyzePattern };
export type { RiskLevel, RiskFactors, RiskAssessment };

export const StreakRiskCalculator = {
  calculate: calculateStreakRisk,
  getRiskLevel,
  analyzePattern,
};

export default StreakRiskCalculator;
