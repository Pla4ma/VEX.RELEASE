import type { CoachMessage, CoachUserState } from "./types";


export function detectBurnout(input: BurnoutInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedSessionDuration: number;
} {
  const { sessionsLast24h, avgQualityLast24h } = input;

  const isBurnoutRisk = sessionsLast24h >= 5 && avgQualityLast24h < 70;

  if (!isBurnoutRisk) {
    return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedSessionDuration: 25,
    };
  }

  // Determine severity
  let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
  if (sessionsLast24h >= 8 && avgQualityLast24h < 50) {
    severity = 'SEVERE';
  } else if (sessionsLast24h >= 6 && avgQualityLast24h < 60) {
    severity = 'MODERATE';
  }

  const intervention: InterventionMessage = {
    content: `You're pushing hard — ${sessionsLast24h} sessions in 24 hours! Your focus quality is dropping, which could hurt your streak. Want a shorter session today to protect your progress? I'll set up a 15-minute chill session.`,
    tone: 'supportive',
    quickResponses: ['Yes, set it up', 'I can handle more', 'Maybe later', 'I need a break'],
  };

  return {
    detected: true,
    severity,
    intervention,
    suggestedSessionDuration: 15, // Chill session
  };
}

export function generateBurnoutMessage(sessionsLast24h: number, avgQuality: number, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const messages: Record<string, string> = {
    MENTOR: `You've completed ${sessionsLast24h} sessions in 24 hours — impressive dedication. But I've noticed your quality scores averaging ${avgQuality}%. To maintain your streak long-term, consider a shorter, focused session today. Quality over quantity.`,
    CHEERLEADER: `Whoa superstar! 🌟 ${sessionsLast24h} sessions?! You're ON FIRE! But I'm seeing your quality dip to ${avgQuality}%. Let's keep that streak strong with a quick 15-min power session. You've got this!`,
    DRILL_SERGEANT: `Listen up. ${sessionsLast24h} sessions shows discipline, but ${avgQuality}% quality is UNACCEPTABLE. Your streak is at risk. Take a 15-minute focused session. NOW. Quality before ego.`,
  };

  return messages[persona];
}

export function detectPlateau(input: PlateauInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedSessionDuration: number;
} {
  const { xpGrowthRate7d, xpGrowthRatePrev7d } = input;

  // Calculate percentage drop
  const dropPercent = xpGrowthRatePrev7d > 0 ? ((xpGrowthRatePrev7d - xpGrowthRate7d) / xpGrowthRatePrev7d) * 100 : 0;

  const isPlateau = dropPercent > 30;

  if (!isPlateau) {
    return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'motivational', quickResponses: [] },
      suggestedSessionDuration: 25,
    };
  }

  // Determine severity
  let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
  if (dropPercent > 60) {
    severity = 'SEVERE';
  } else if (dropPercent > 45) {
    severity = 'MODERATE';
  }

  const intervention: InterventionMessage = {
    content: `You've been in a groove, but I've noticed your XP growth slowed ${dropPercent.toFixed(0)}% over the last week. Try a longer session today — I think you're capable of more. A 60-minute deep focus could break through.`,
    tone: 'motivational',
    quickResponses: ["Let's do 60 min", 'Start with 30', "What's my pattern?", 'Not today'],
  };

  return {
    detected: true,
    severity,
    intervention,
    suggestedSessionDuration: 60, // Push session
  };
}

export function generatePlateauMessage(dropPercent: number, sessionsPerWeekTrend: string, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const trendText = sessionsPerWeekTrend === 'DECREASING' ? 'I also see your session frequency dropping.' : 'Your session count is steady, but intensity is down.';

  const messages: Record<string, string> = {
    MENTOR: `Your XP growth has slowed ${dropPercent.toFixed(0)}% this week. ${trendText} You've hit a plateau — this is normal. To break through, try a longer session at your peak focus time. Growth happens outside comfort zones.`,
    CHEERLEADER: `Hey champ! 📉 I see your XP growth dipped ${dropPercent.toFixed(0)}%. No worries — plateaus happen! ${trendText} Let's CRUSH this with a 60-min powerhouse session. You're stronger than this plateau! 💪`,
    DRILL_SERGEANT: `Your numbers are DROPPING. ${dropPercent.toFixed(0)}% decline. ${trendText} This is complacency. You think you're working hard? You're coasting. 60 minutes. Today. NO EXCUSES.`,
  };

  return messages[persona];
}

export function detectStreakRescueNeeded(input: StreakRescueInput): {
  needsRescue: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  intervention: InterventionMessage;
  suggestedSessionDuration: number;
} {
  const { streakDays, hoursUntilStreakBreak, hasActiveSession } = input;

  // Don't intervene if already in a session
  if (hasActiveSession) {
    return {
      needsRescue: false,
      urgency: 'LOW',
      intervention: { content: '', tone: 'urgent', quickResponses: [] },
      suggestedSessionDuration: 15,
    };
  }

  // Determine urgency based on hours remaining
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

  if (!needsRescue) {
    return {
      needsRescue: false,
      urgency: 'LOW',
      intervention: { content: '', tone: 'urgent', quickResponses: [] },
      suggestedSessionDuration: 15,
    };
  }

  const urgencyEmojis: Record<string, string> = {
    CRITICAL: '🚨',
    HIGH: '⚠️',
    MEDIUM: '⏰',
    LOW: '🔔',
  };

  const intervention: InterventionMessage = {
    content: `${urgencyEmojis[urgency]} Your ${streakDays}-day streak breaks in ${hoursUntilStreakBreak} hours. I'm holding a 15-minute session slot for you right now. One quick focus session saves your streak!`,
    tone: 'urgent',
    quickResponses: ['Start now!', '15 min later', "I'm busy", 'Protect my streak'],
  };

  return {
    needsRescue,
    urgency,
    intervention,
    suggestedSessionDuration: 15, // Minimum qualifying session
  };
}