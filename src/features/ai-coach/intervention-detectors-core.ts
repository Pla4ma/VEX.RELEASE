import type {
  BurnoutInput,
  PlateauInput,
  StreakRescueInput,
  BossStrategyInput,
  BossStrategy,
  InterventionMessage,
} from './intervention-types';

export function detectBurnout(input: BurnoutInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedSessionDuration: number;
} {
  const { sessionsLast24h, avgQualityLast24h } = input;
  const isBurnoutRisk = sessionsLast24h >= 5 && avgQualityLast24h < 70;
  if (!isBurnoutRisk)
    {return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedSessionDuration: 25,
    };}
  let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
  if (sessionsLast24h >= 8 && avgQualityLast24h < 50) {severity = 'SEVERE';}
  else if (sessionsLast24h >= 6 && avgQualityLast24h < 60)
    {severity = 'MODERATE';}
  const intervention: InterventionMessage = {
    content: `You're pushing hard — ${sessionsLast24h} sessions in 24 hours! Your focus quality is dropping, which could hurt your streak. Want a shorter session today to protect your progress? I'll set up a 15-minute chill session.`,
    tone: 'supportive',
    quickResponses: [
      'Yes, set it up',
      'I can handle more',
      'Maybe later',
      'I need a break',
    ],
  };
  return {
    detected: true,
    severity,
    intervention,
    suggestedSessionDuration: 15,
  };
}

export function detectPlateau(input: PlateauInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedSessionDuration: number;
} {
  const { xpGrowthRate7d, xpGrowthRatePrev7d } = input;
  const dropPercent =
    xpGrowthRatePrev7d > 0
      ? ((xpGrowthRatePrev7d - xpGrowthRate7d) / xpGrowthRatePrev7d) * 100
      : 0;
  const isPlateau = dropPercent > 30;
  if (!isPlateau)
    {return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'motivational', quickResponses: [] },
      suggestedSessionDuration: 25,
    };}
  let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
  if (dropPercent > 60) {severity = 'SEVERE';}
  else if (dropPercent > 45) {severity = 'MODERATE';}
  const intervention: InterventionMessage = {
    content: `Your XP growth has slowed ${dropPercent.toFixed(0)}% over the last week based on your session data. Try a longer session today — a 60-minute deep focus could break through your current rhythm.`,
    tone: 'motivational',
    quickResponses: [
      "Let's do 60 min",
      'Start with 30',
      "What's my pattern?",
      'Not today',
    ],
  };
  return {
    detected: true,
    severity,
    intervention,
    suggestedSessionDuration: 60,
  };
}

export function detectStreakRescueNeeded(input: StreakRescueInput): {
  needsRescue: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  intervention: InterventionMessage;
  suggestedSessionDuration: number;
} {
  const { streakDays, hoursUntilStreakBreak, hasActiveSession } = input;
  if (hasActiveSession)
    {return {
      needsRescue: false,
      urgency: 'LOW',
      intervention: { content: '', tone: 'urgent', quickResponses: [] },
      suggestedSessionDuration: 15,
    };}
  let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let needsRescue = false;
  if (hoursUntilStreakBreak <= 2) {
    urgency = 'CRITICAL';
    needsRescue = true;
  } else if (hoursUntilStreakBreak <= 4) {
    urgency = 'HIGH';
    needsRescue = true;
  } else if (hoursUntilStreakBreak <= 6) {
    urgency = 'MEDIUM';
    needsRescue = true;
  }
  if (!needsRescue)
    {return {
      needsRescue: false,
      urgency: 'LOW',
      intervention: { content: '', tone: 'urgent', quickResponses: [] },
      suggestedSessionDuration: 15,
    };}
  const urgencyEmojis: Record<string, string> = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🟢',
  };
  const intervention: InterventionMessage = {
    content: `${urgencyEmojis[urgency] ?? ''} Your ${streakDays}-day streak breaks in ${hoursUntilStreakBreak} hours. I'm holding a 15-minute session slot for you right now. One quick focus session saves your streak!`,
    tone: 'urgent',
    quickResponses: [
      'Start now!',
      '15 min later',
      "I'm busy",
      'Protect my streak',
    ],
  };
  return { needsRescue, urgency, intervention, suggestedSessionDuration: 15 };
}

export function detectBossStrategyOpportunity(input: BossStrategyInput): {
  shouldShow: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  intervention: InterventionMessage;
  strategy: BossStrategy;
} {
  const { bossHealthPercent, bossTimeRemaining, currentStreakMultiplier } =
    input;
  const shouldShow = bossHealthPercent < 30 && bossTimeRemaining > 0;
  if (!shouldShow)
    {return {
      shouldShow: false,
      priority: 'LOW',
      intervention: { content: '', tone: 'strategic', quickResponses: [] },
      strategy: {
        recommendedDuration: 25,
        targetQuality: 'S',
        expectedDamage: 0,
      },
    };}
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (bossTimeRemaining < 4) {priority = 'HIGH';}
  else if (bossHealthPercent < 15) {priority = 'HIGH';}
  else if (bossTimeRemaining < 12) {priority = 'MEDIUM';}
  const strategy: BossStrategy = {
    recommendedDuration: 45,
    targetQuality: 'S',
    expectedDamage: Math.floor(45 * currentStreakMultiplier * 1.2),
  };
  const intervention: InterventionMessage = {
    content: `Boss is almost down — ${bossHealthPercent.toFixed(0)}% health left! One focused session at S quality = killing blow. Your ${currentStreakMultiplier}x streak multiplier is active = maximum damage. Time to finish this!`,
    tone: 'strategic',
    quickResponses: [
      'Finish the boss!',
      '45 min session',
      'What damage will I deal?',
      'Later',
    ],
  };
  return { shouldShow, priority, intervention, strategy };
}
