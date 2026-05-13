import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


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
  const weekendRisk = ['Sat', 'Sun'].some((day) => userDay.includes(day));

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
    score += WEIGHTS.PATTERN_DECLINE * 100 * 0.5;
  }

  // Quality drop factor (15%)
  if (recentQuality < 50) {
    score += WEIGHTS.QUALITY_DROP * 100;
  } else if (recentQuality < 70) {
    score += WEIGHTS.QUALITY_DROP * 100 * 0.5;
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

function analyzePattern(sessionHistory: { timestamp: number; quality: number }[]): 'CONSISTENT' | 'VARIABLE' | 'DECLINING' {
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