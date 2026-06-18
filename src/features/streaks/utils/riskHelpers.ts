import type { RiskLevel, RiskFactors } from './riskTypes';
import {
  CRITICAL_THRESHOLD,
  HIGH_THRESHOLD,
  MEDIUM_THRESHOLD,
  DAY_HOURS,
} from './riskTypes';

export function analyzePattern(
  sessionHistory: { timestamp: number; quality: number }[],
): 'CONSISTENT' | 'VARIABLE' | 'DECLINING' {
  if (sessionHistory.length < 5) {
    return 'CONSISTENT';
  }
  const gaps: number[] = [];
  for (let i = 1; i < sessionHistory.length; i++) {
    const gap =
      ((sessionHistory[i]?.timestamp ?? 0) - (sessionHistory[i - 1]?.timestamp ?? 0)) /
      (DAY_HOURS * 60 * 60 * 1000);
    gaps.push(gap);
  }
  let increasingCount = 0;
  for (let i = 1; i < gaps.length; i++) {
    if ((gaps[i] ?? 0) > (gaps[i - 1] ?? 0)) {
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

export function calculateRecentQuality(
  sessionHistory: { timestamp: number; quality: number }[],
): number {
  if (sessionHistory.length === 0) {
    return 100;
  }
  const recent = sessionHistory.slice(-5);
  const avg = recent.reduce((sum, s) => sum + s.quality, 0) / recent.length;
  return Math.round(avg);
}

export function getRiskLevel(
  score: number,
  hoursSinceLastSession: number,
): RiskLevel {
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

export function getUrgency(
  level: RiskLevel,
  hoursSinceLastSession: number,
  daysUntilBreak: number,
): 'NONE' | 'SOON' | 'URGENT' | 'CRITICAL' {
  if (level === 'CRITICAL') {
    return 'CRITICAL';
  }
  if (level === 'HIGH') {
    return 'URGENT';
  }
  if (level === 'MEDIUM' && hoursSinceLastSession > 18) {
    return 'URGENT';
  }
  if (level === 'MEDIUM') {
    return 'SOON';
  }
  if (level === 'LOW' && daysUntilBreak <= 1) {
    return 'SOON';
  }
  return 'NONE';
}

export function getSuggestedAction(
  level: RiskLevel,
  urgency: string,
): 'NONE' | 'REMINDER' | 'PUSH' | 'INTERVENTION' {
  if (level === 'CRITICAL') {
    return 'INTERVENTION';
  }
  if (level === 'HIGH') {
    return 'PUSH';
  }
  if (level === 'MEDIUM' && urgency === 'URGENT') {
    return 'PUSH';
  }
  if (level === 'MEDIUM') {
    return 'REMINDER';
  }
  if (level === 'LOW') {
    return 'REMINDER';
  }
  return 'NONE';
}

export function generateRecommendation(
  level: RiskLevel,
  factors: RiskFactors,
): string {
  const { hoursSinceLastSession, typicalSessionHour, weekendRisk } = factors;
  switch (level) {
    case 'CRITICAL':
      return 'Your streak is about to break! Start a session NOW to save it.';
    case 'HIGH': {
      const hoursLeft = Math.max(0, CRITICAL_THRESHOLD - hoursSinceLastSession);
      return `High risk! You have about ${Math.floor(hoursLeft)} hours left. Your typical time is ${typicalSessionHour}:00.`;
    }
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
