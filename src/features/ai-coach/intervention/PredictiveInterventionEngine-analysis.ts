import type { RiskAssessment } from './PredictiveInterventionEngine-types';

export function analyzeCreatureNeglect(creatureData: {
  lastFedAt: number | null;
  lastPlayedAt: number | null;
  happiness: number;
  health: number;
  level: number;
  evolutionProgress: number;
}): RiskAssessment {
  const now = Date.now();
  const evidence: string[] = [];
  let confidence = 0;
  if (
    creatureData.lastFedAt &&
    now - creatureData.lastFedAt > 24 * 60 * 60 * 1000
  ) {
    evidence.push('Creature not fed for over 24 hours');
    confidence += 0.4;
  }
  if (creatureData.happiness < 30) {
    evidence.push(`Very low happiness (${creatureData.happiness}%)`);
    confidence += 0.3;
  }
  if (creatureData.health < 40) {
    evidence.push(`Poor health (${creatureData.health}%)`);
    confidence += 0.3;
  }
  if (creatureData.evolutionProgress < 20 && creatureData.level > 1) {
    evidence.push('Evolution progress stalled');
    confidence += 0.2;
  }
  const severity: RiskAssessment['severity'] =
    confidence > 0.6 ? 'high' : confidence > 0.3 ? 'medium' : 'low';
  return {
    confidence: Math.min(1, confidence),
    severity,
    evidence,
    action:
      'Your creature needs attention! Feed and play with it to keep it happy and healthy.',
  };
}

export function analyzeRaidParticipation(raidHistory: Array<{
  weekStart: string;
  participated: boolean;
  damage: number;
  squadId: string;
}>): RiskAssessment {
  const evidence: string[] = [];
  let confidence = 0;
  const last4Weeks = raidHistory.slice(-4);
  const missedWeeks = last4Weeks.filter((week) => !week.participated).length;
  if (missedWeeks >= 2) {
    evidence.push(`Missed ${missedWeeks} of the last 4 weekend raids`);
    confidence += 0.4;
  }
  const participatingWeeks = last4Weeks.filter((week) => week.participated);
  const avgDamage =
    participatingWeeks.reduce((sum, week) => sum + week.damage, 0) /
    (participatingWeeks.length || 1);
  if (avgDamage < 1000) {
    evidence.push('Low contribution when participating in raids');
    confidence += 0.2;
  }
  if (last4Weeks.length >= 3) {
    const recent = last4Weeks.slice(-2);
    const older = last4Weeks.slice(-4, -2);
    const recentParticipation = recent.filter(
      (week) => week.participated,
    ).length;
    const olderParticipation = older.filter(
      (week) => week.participated,
    ).length;
    if (recentParticipation < olderParticipation) {
      evidence.push('Declining raid participation trend');
      confidence += 0.3;
    }
  }
  const severity: RiskAssessment['severity'] =
    confidence > 0.5 ? 'medium' : 'low';
  return {
    confidence: Math.min(1, confidence),
    severity,
    evidence,
    action:
      'Weekend raids are starting! Join your squad for epic rewards and teamwork.',
  };
}

export function analyzePrimeTimeParticipation(eventHistory: Array<{
  eventType: string;
  participated: boolean;
  timestamp: number;
  rewards: Record<string, number>;
}>): RiskAssessment {
  const evidence: string[] = [];
  let confidence = 0;
  const last7Days = eventHistory.filter(
    (event) => Date.now() - event.timestamp < 7 * 24 * 60 * 60 * 1000,
  );
  const missedEvents = last7Days.filter(
    (event) => !event.participated,
  ).length;
  if (missedEvents >= 3) {
    evidence.push(`Missed ${missedEvents} bonus events in the past week`);
    confidence += 0.4;
  }
  const morningEvents = last7Days.filter((event) =>
    event.eventType.includes('MORNING'),
  );
  const missedMorningEvents = morningEvents.filter(
    (event) => !event.participated,
  ).length;
  if (
    morningEvents.length >= 2 &&
    missedMorningEvents === morningEvents.length
  ) {
    evidence.push('Consistently missing Morning Rally events');
    confidence += 0.3;
  }
  const totalRewards = last7Days.reduce(
    (sum, event) =>
      sum +
      Object.values(event.rewards).reduce((rSum, reward) => rSum + reward, 0),
    0,
  );
  if (totalRewards < 100) {
    evidence.push('Low bonus reward accumulation');
    confidence += 0.2;
  }
  const severity: RiskAssessment['severity'] =
    confidence > 0.4 ? 'medium' : 'low';
  return {
    confidence: Math.min(1, confidence),
    severity,
    evidence,
    action:
      "You're missing bonus events! Check the schedule for upcoming Prime Time events.",
  };
}

export function analyzeCreatureEvolutionStall(creature: {
  stage: string;
  evolutionProgress: number;
  currentStreak: number;
  totalSessions: number;
  averagePurity: number;
  lastEvolutionAt: number | null;
}): RiskAssessment {
  const evidence: string[] = [];
  let confidence = 0;
  if (
    creature.stage === 'BABY' &&
    creature.evolutionProgress < 50 &&
    creature.totalSessions > 20
  ) {
    evidence.push('Stuck in Baby stage despite good activity');
    confidence += 0.4;
  }
  if (creature.lastEvolutionAt) {
    const weeksSinceEvolution =
      (Date.now() - creature.lastEvolutionAt) / (7 * 24 * 60 * 60 * 1000);
    if (weeksSinceEvolution > 2 && creature.evolutionProgress < 80) {
      evidence.push('Slow evolution progress over time');
      confidence += 0.3;
    }
  }
  if (creature.currentStreak > 10 && creature.evolutionProgress < 60) {
    evidence.push('Strong streak but poor evolution progress');
    confidence += 0.3;
  }
  if (creature.averagePurity < 75) {
    evidence.push(
      `Low session purity (${creature.averagePurity}%) affecting evolution`,
    );
    confidence += 0.2;
  }
  const severity: RiskAssessment['severity'] =
    confidence > 0.6 ? 'medium' : 'low';
  return {
    confidence: Math.min(1, confidence),
    severity,
    evidence,
    action:
      'Focus on higher purity sessions to help your creature evolve faster!',
  };
}
