import type {
  BehavioralPattern,
  RiskPrediction,
  RiskAssessment,
  OptimalTimeResult,
  SessionRecord,
} from "./PredictiveInterventionEngine-types";

export function calculateBreakFrequency(
  history: Array<{ date: string; completed: boolean }>,
): number {
  let breaks = 0;
  let currentStreak = 0;
  for (const session of history) {
    if (session.completed) {
      currentStreak++;
    } else {
      if (currentStreak > 3) breaks++;
      currentStreak = 0;
    }
  }
  return breaks;
}

export function getTopEntries(
  counts: Map<number, number>,
  limit: number,
): number[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

export function getDefaultPattern(userId: string): BehavioralPattern {
  return {
    userId,
    patternType: "consistent",
    daysOfWeek: [1, 2, 3, 4, 5],
    timeOfDay: [9, 14, 20],
    averageSessionDuration: 25,
    completionRate: 0.7,
    streakBreakFrequency: 1,
    last30DaysTrend: "stable",
  };
}

export function createRiskPrediction(
  userId: string,
  type: RiskPrediction["type"],
  now: number,
  assessment: RiskAssessment,
  predictedToOccurAt: number,
): RiskPrediction {
  return {
    id: `pred_${userId}_${type.toLowerCase()}_${now}`,
    userId,
    type,
    confidence: assessment.confidence,
    predictedAt: now,
    predictedToOccurAt,
    severity: assessment.severity,
    evidence: assessment.evidence,
    recommendedAction: assessment.action,
    interventionSent: false,
    interventionType: "",
    actualOutcome: null,
    outcomeVerifiedAt: null,
  };
}

export function computeBehavioralPattern(
  userId: string,
  sessionHistory: SessionRecord[],
): BehavioralPattern {
  const last30Days = sessionHistory.slice(-30);
  const completed = last30Days.filter((s) => s.completed).length;
  const completionRate =
    last30Days.length > 0 ? completed / last30Days.length : 0;
  const dayCounts = new Map<number, number>();
  const hourCounts = new Map<number, number>();
  for (const s of last30Days) {
    dayCounts.set(s.dayOfWeek, (dayCounts.get(s.dayOfWeek) || 0) + 1);
    hourCounts.set(s.hour, (hourCounts.get(s.hour) || 0) + 1);
  }
  const daysOfWeek = getTopEntries(dayCounts, 3);
  const timeOfDay = getTopEntries(hourCounts, 3);
  const firstHalf = last30Days.slice(0, 15).filter((s) => s.completed).length;
  const secondHalf = last30Days.slice(15).filter((s) => s.completed).length;
  let last30DaysTrend: "up" | "stable" | "down" = "stable";
  if (secondHalf > firstHalf * 1.2) last30DaysTrend = "up";
  else if (secondHalf < firstHalf * 0.8) last30DaysTrend = "down";
  let patternType: BehavioralPattern["patternType"] = "consistent";
  if (completionRate < 0.5) patternType = "inconsistent";
  else if (last30DaysTrend === "down") patternType = "declining";
  else if (last30DaysTrend === "up") patternType = "improving";
  const avgDuration =
    last30Days.length > 0
      ? last30Days.reduce((sum, s) => sum + s.duration, 0) / last30Days.length
      : 0;
  return {
    userId,
    patternType,
    daysOfWeek,
    timeOfDay,
    averageSessionDuration: avgDuration,
    completionRate,
    streakBreakFrequency: calculateBreakFrequency(sessionHistory),
    last30DaysTrend,
  };
}

export function assessStreakBreakRisk(
  pattern: BehavioralPattern,
  hoursSinceLastSession: number,
): RiskAssessment {
  const evidence: string[] = [];
  let confidence = 0;
  let severity: RiskAssessment["severity"] = "low";
  if (hoursSinceLastSession > 20) {
    evidence.push(`${Math.floor(hoursSinceLastSession)} hours since last session`);
    confidence += 0.3;
  }
  if (pattern.patternType === "inconsistent") {
    evidence.push("Inconsistent completion pattern detected");
    confidence += 0.2;
  }
  if (pattern.completionRate < 0.5) {
    evidence.push(`Low completion rate (${Math.floor(pattern.completionRate * 100)}%)`);
    confidence += 0.2;
  }
  if (pattern.streakBreakFrequency > 2) {
    evidence.push(`${pattern.streakBreakFrequency} streak breaks this month`);
    confidence += 0.2;
  }
  if (pattern.last30DaysTrend === "down") {
    evidence.push("Activity declining over last 30 days");
    confidence += 0.1;
  }
  if (hoursSinceLastSession > 40) severity = "critical";
  else if (hoursSinceLastSession > 30) severity = "high";
  else if (hoursSinceLastSession > 24) severity = "medium";
  const action =
    hoursSinceLastSession > 30
      ? "Complete a session in the next 6 hours to save your streak!"
      : "Your streak is at risk. Complete a session today!";
  return { confidence: Math.min(1, confidence), severity, evidence, action };
}
export function assessBurnoutRisk(pattern: BehavioralPattern): RiskAssessment {
  const evidence: string[] = [];
  let confidence = 0;
  if (pattern.completionRate > 0.95) {
    evidence.push("Very high completion rate - possible overexertion");
    confidence += 0.3;
  }
  if (pattern.averageSessionDuration > 90) {
    evidence.push(`Long average sessions (${Math.floor(pattern.averageSessionDuration)} min)`);
    confidence += 0.2;
  }
  if (pattern.daysOfWeek.length === 7) {
    evidence.push("No rest days detected");
    confidence += 0.2;
  }
  const severity: RiskAssessment["severity"] = confidence > 0.5 ? "medium" : "low";
  return {
    confidence: Math.min(1, confidence),
    severity,
    evidence,
    action: "Consider taking a rest day. Your streak is strong enough to handle it!",
  };
}
export function calculateOptimalTime(pattern: BehavioralPattern): OptimalTimeResult {
  if (pattern.timeOfDay.length === 0) {
    return { confidence: 0, nextWindow: 0, evidence: [], action: "" };
  }
  const bestHour = pattern.timeOfDay[0]!;
  const now = new Date();
  const nextWindow = new Date();
  if (now.getHours() < bestHour) {
    nextWindow.setHours(bestHour, 0, 0, 0);
  } else {
    nextWindow.setDate(nextWindow.getDate() + 1);
    nextWindow.setHours(bestHour, 0, 0, 0);
  }
  return {
    confidence: 0.7,
    nextWindow: nextWindow.getTime(),
    evidence: [`You typically focus best at ${bestHour}:00`],
    action: `Your optimal focus time is ${bestHour}:00. Try scheduling your next session then!`,
  };
}

export function generateStreakInterventionMessage(prediction: RiskPrediction): string {
  const hours = prediction.evidence.find((e) => e.includes("hours"));
  if (hours) return `${hours}. Your streak is your progress - don't let it slip away! 💪`;
  return "Your streak is at risk! Complete a session today to keep your momentum! 🔥";
}
export function generateBurnoutMessage(): string {
  return "You've been incredibly consistent! Consider a lighter session today - your streak can handle one easy day. Rest is part of the journey! 🌱";
}
