/**
 * Streak Risk Calculator
 *
 * Predicts streak breakage risk based on user behavior patterns.
 * Provides early warning system for at-risk streaks.
 *
 * @phase 5 - Deepening: Streak risk calculation
 */

import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';

const debug = createDebugger('streaks:risk');

// ============================================================================
// Types
// ============================================================================

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactors {
  hoursSinceLastSession: number;
  typicalSessionHour: number;
  currentHour: number;
  historicalPattern: 'CONSISTENT' | 'VARIABLE' | 'DECLINING';
  daysUntilStreakBreak: number;
  recentSessionQuality: number; // 0-100
  weekendRisk: boolean;
  vacationMode: boolean;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0-100
  factors: RiskFactors;
  recommendation: string;
  urgency: 'NONE' | 'SOON' | 'URGENT' | 'CRITICAL';
  suggestedAction: 'NONE' | 'REMINDER' | 'PUSH' | 'INTERVENTION';
}

// ============================================================================
// Risk Calculation Weights
// ============================================================================

const WEIGHTS = {
  TIME_DRIFT: 0.25, // Deviation from typical session time
  HOURS_ELAPSED: 0.30, // Raw hours since last session
  PATTERN_DECLINE: 0.20, // Historical declining pattern
  QUALITY_DROP: 0.15, // Recent poor session quality
  WEEKEND_FACTOR: 0.10, // Weekend/vacation risk
} as const;

const DAY_HOURS = 24;
const CRITICAL_THRESHOLD = 20; // Hours before streak break
const HIGH_THRESHOLD = 12;
const MEDIUM_THRESHOLD = 6;

// ============================================================================
// Core Calculation
// ============================================================================

/**
 * Calculate comprehensive streak risk
 */
export function calculateStreakRisk(
  currentStreak: number,
  lastSessionAt: number,
  userPatterns: {
    typicalSessionHour: number;
    sessionHistory: { timestamp: number; quality: number }[];
    timezone: string;
  }
): RiskAssessment {
  const now = Date.now();
  const hoursSinceLastSession = (now - lastSessionAt) / (60 * 60 * 1000);

  // Get current hour in user's timezone
  const userTime = new Date(now).toLocaleString('en-US', {
    timeZone: userPatterns.timezone,
    hour: 'numeric',
    hour12: false,
  });
  const currentHour = parseInt(userTime, 10);

  // Calculate days until streak break (assume midnight cutoff)
  const lastSessionDate = new Date(lastSessionAt);
  const nowDate = new Date(now);
  const daysDifference = Math.floor((nowDate.getTime() - lastSessionDate.getTime()) / (DAY_HOURS * 60 * 60 * 1000));
  const daysUntilBreak = Math.max(0, 1 - daysDifference);

  // Analyze historical pattern
  const historicalPattern = analyzePattern(userPatterns.sessionHistory);

  // Calculate recent quality trend
  const recentQuality = calculateRecentQuality(userPatterns.sessionHistory);

  // Weekend risk check
  const userDay = new Date(now).toLocaleString('en-US', {
    timeZone: userPatterns.timezone,
    weekday: 'short',
  });
  const weekendRisk = ['Sat', 'Sun'].some(day => userDay.includes(day));

  const factors: RiskFactors = {
    hoursSinceLastSession,
    typicalSessionHour: userPatterns.typicalSessionHour,
    currentHour,
    historicalPattern,
    daysUntilStreakBreak: daysUntilBreak,
    recentSessionQuality: recentQuality,
    weekendRisk,
    vacationMode: false, // Would check user settings
  };

  // Calculate risk score
  let score = 0;

  // Time drift factor (25%)
  const timeDrift = Math.abs(currentHour - userPatterns.typicalSessionHour);
  const normalizedDrift = Math.min(timeDrift / 12, 1); // Max 12 hours drift = 100%
  score += normalizedDrift * WEIGHTS.TIME_DRIFT * 100;

  // Hours elapsed factor (30%)
  const hoursFactor = Math.min(hoursSinceLastSession / CRITICAL_THRESHOLD, 1);
  score += hoursFactor * WEIGHTS.HOURS_ELAPSED * 100;

  // Pattern decline factor (20%)
  if (historicalPattern === 'DECLINING') {
    score += WEIGHTS.PATTERN_DECLINE * 100;
  } else if (historicalPattern === 'VARIABLE') {
    score += (WEIGHTS.PATTERN_DECLINE * 100) * 0.5;
  }

  // Quality drop factor (15%)
  if (recentQuality < 50) {
    score += WEIGHTS.QUALITY_DROP * 100;
  } else if (recentQuality < 70) {
    score += (WEIGHTS.QUALITY_DROP * 100) * 0.5;
  }

  // Weekend factor (10%)
  if (weekendRisk) {
    score += WEIGHTS.WEEKEND_FACTOR * 100;
  }

  // Cap score at 100
  score = Math.min(Math.round(score), 100);

  // Determine risk level
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

  // Track high-risk streaks
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

// ============================================================================
// Helper Functions
// ============================================================================

function analyzePattern(
  sessionHistory: { timestamp: number; quality: number }[]
): 'CONSISTENT' | 'VARIABLE' | 'DECLINING' {
  if (sessionHistory.length < 5) {
    return 'CONSISTENT'; // Not enough data
  }

  // Calculate gaps between sessions
  const gaps: number[] = [];
  for (let i = 1; i < sessionHistory.length; i++) {
    const gap = (sessionHistory[i].timestamp - sessionHistory[i - 1].timestamp) / (DAY_HOURS * 60 * 60 * 1000);
    gaps.push(gap);
  }

  // Check for increasing gaps (declining pattern)
  let increasingCount = 0;
  for (let i = 1; i < gaps.length; i++) {
    if (gaps[i] > gaps[i - 1]) {
      increasingCount++;
    }
  }

  const increasingRatio = increasingCount / (gaps.length - 1);

  if (increasingRatio > 0.7) {
    return 'DECLINING';
  } else if (increasingRatio > 0.3) {
    return 'VARIABLE';
  }

  return 'CONSISTENT';
}

function calculateRecentQuality(
  sessionHistory: { timestamp: number; quality: number }[]
): number {
  if (sessionHistory.length === 0) {return 100;}

  // Take last 5 sessions
  const recent = sessionHistory.slice(-5);
  const avg = recent.reduce((sum, s) => sum + s.quality, 0) / recent.length;

  return Math.round(avg);
}

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

function getUrgency(
  level: RiskLevel,
  hoursSinceLastSession: number,
  daysUntilBreak: number
): 'NONE' | 'SOON' | 'URGENT' | 'CRITICAL' {
  if (level === 'CRITICAL') {return 'CRITICAL';}
  if (level === 'HIGH') {return 'URGENT';}
  if (level === 'MEDIUM' && hoursSinceLastSession > 18) {return 'URGENT';}
  if (level === 'MEDIUM') {return 'SOON';}
  if (level === 'LOW' && daysUntilBreak <= 1) {return 'SOON';}
  return 'NONE';
}

function getSuggestedAction(
  level: RiskLevel,
  urgency: string
): 'NONE' | 'REMINDER' | 'PUSH' | 'INTERVENTION' {
  if (level === 'CRITICAL') {return 'INTERVENTION';}
  if (level === 'HIGH') {return 'PUSH';}
  if (level === 'MEDIUM' && urgency === 'URGENT') {return 'PUSH';}
  if (level === 'MEDIUM') {return 'REMINDER';}
  if (level === 'LOW') {return 'REMINDER';}
  return 'NONE';
}

function generateRecommendation(level: RiskLevel, factors: RiskFactors): string {
  const { hoursSinceLastSession, typicalSessionHour, weekendRisk } = factors;

  switch (level) {
    case 'CRITICAL':
      return 'Your streak is about to break! Start a session NOW to save it.';

    case 'HIGH':
      const hoursLeft = Math.max(0, CRITICAL_THRESHOLD - hoursSinceLastSession);
      return `High risk! You have about ${Math.floor(hoursLeft)} hours left. Your typical time is ${typicalSessionHour}:00.`;

    case 'MEDIUM':
      if (weekendRisk) {
        return 'Weekend streak risk detected. Consider an earlier session today.';
      }
      return `Getting close to your usual session time (${typicalSessionHour}:00).`;

    case 'LOW':
      return 'Stay on track! Your streak is safe for now.';

    case 'NONE':
      return 'Great job maintaining your streak!';

    default:
      return '';
  }
}

// ============================================================================
// Export
// ============================================================================

export { getRiskLevel, analyzePattern };

export const StreakRiskCalculator = {
  calculate: calculateStreakRisk,
  getRiskLevel,
  analyzePattern,
};

export default StreakRiskCalculator;
