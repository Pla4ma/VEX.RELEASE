import type {
  BehavioralPattern,
  OptimalTimeResult,
  RiskPrediction,
} from './PredictiveInterventionEngine-types';

export function generateStreakInterventionMessage(prediction: RiskPrediction): string {
  const hours = prediction.evidence.find((e) => e.includes('hours'));
  if (hours) {return `${hours}. Your streak is your progress - don't let it slip away! 💪`;}
  return 'Your streak is at risk! Complete a session today to keep your momentum! 🔥';
}

export function generateBurnoutMessage(): string {
  return "You've been incredibly consistent! Consider a lighter session today - your streak can handle one easy day. Rest is part of the journey! 🌱";
}

export function calculateOptimalTime(pattern: BehavioralPattern): OptimalTimeResult {
  if (pattern.timeOfDay.length === 0) {
    return { confidence: 0, nextWindow: 0, evidence: [], action: '' };
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
