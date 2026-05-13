import type { CoachMessage, CoachUserState } from "./types";


export function generateStreakRescueMessage(streakDays: number, hoursRemaining: number, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const timeText = hoursRemaining <= 2 ? `${hoursRemaining} HOURS` : `${hoursRemaining} hours`;

  const messages: Record<string, string> = {
    MENTOR: `Your ${streakDays}-day streak is at risk. You have ${timeText} remaining. I've analyzed your patterns — a 15-minute session right now will maintain your momentum. Your future self will thank you.`,
    CHEERLEADER: `Oh no! 😱 Your 🔥 ${streakDays}-day streak is about to break! Only ${timeText} left! But don't worry — I'm here! A quick 15-min session saves it all. You can do this! Tap below! 🌟`,
    DRILL_SERGEANT: `DISASTER INCOMING. Your ${streakDays}-day streak breaks in ${timeText}. This is what happens when you procrastinate. 15 minutes. RIGHT NOW. Move.`,
  };

  return messages[persona];
}

export function detectBossStrategyOpportunity(input: BossStrategyInput): {
  shouldShow: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  intervention: InterventionMessage;
  strategy: BossStrategy;
} {
  const { bossHealthPercent, bossTimeRemaining, currentStreakMultiplier } = input;

  const shouldShow = bossHealthPercent < 30 && bossTimeRemaining > 0;

  if (!shouldShow) {
    return {
      shouldShow: false,
      priority: 'LOW',
      intervention: { content: '', tone: 'strategic', quickResponses: [] },
      strategy: { recommendedDuration: 25, targetQuality: 'S', expectedDamage: 0 },
    };
  }

  // Determine priority based on time remaining
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (bossTimeRemaining < 4) {
    priority = 'HIGH';
  } else if (bossHealthPercent < 15) {
    priority = 'HIGH';
  } else if (bossTimeRemaining < 12) {
    priority = 'MEDIUM';
  }

  const strategy: BossStrategy = {
    recommendedDuration: 45, // Longer session for max damage
    targetQuality: 'S', // S-grade for critical hit chance
    expectedDamage: Math.floor(45 * currentStreakMultiplier * 1.2), // Base + streak + quality bonus
  };

  const intervention: InterventionMessage = {
    content: `Boss is almost down — ${bossHealthPercent.toFixed(0)}% health left! One focused session at S quality = killing blow. Your ${currentStreakMultiplier}x streak multiplier is active = maximum damage. Time to finish this!`,
    tone: 'strategic',
    quickResponses: ['Finish the boss!', '45 min session', 'What damage will I deal?', 'Later'],
  };

  return {
    shouldShow,
    priority,
    intervention,
    strategy,
  };
}

export function generateBossStrategyMessage(bossHealthPercent: number, timeRemaining: number, streakMultiplier: number, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const messages: Record<string, string> = {
    MENTOR: `The boss is near defeat at ${bossHealthPercent.toFixed(0)}% health. With ${timeRemaining} hours remaining and your ${streakMultiplier}x streak multiplier active, a 45-minute S-quality session will deal the killing blow. This is your moment.`,
    CHEERLEADER: `OMG! 🎉 The boss is ALMOST DOWN! ${bossHealthPercent.toFixed(0)}% health left! Your ${streakMultiplier}x streak multiplier is CRUSHING IT! One epic 45-min S-quality session = BOOM! Victory! Let's DO THIS! 👑`,
    DRILL_SERGEANT: `FINISH HIM. ${bossHealthPercent.toFixed(0)}% health. ${timeRemaining} hours. ${streakMultiplier}x multiplier. 45 minutes. S-quality. No pauses. This is what you've trained for. ATTACK.`,
  };

  return messages[persona];
}

export function detectStudyStuck(input: StudyStuckInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { minutesOnSameSection, documentName, sectionName } = input;

  const isStuck = minutesOnSameSection >= 30;

  if (!isStuck) {
    return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };
  }

  const severity: 'MILD' | 'MODERATE' | 'SEVERE' = minutesOnSameSection >= 60 ? 'SEVERE' : minutesOnSameSection >= 45 ? 'MODERATE' : 'MILD';

  const sectionText = sectionName ? ` on "${sectionName}"` : '';

  const intervention: InterventionMessage = {
    content: `You've been on ${documentName}${sectionText} for ${minutesOnSameSection} minutes. Are you stuck? I can help summarize, quiz you, or suggest a different section.`,
    tone: 'supportive',
    quickResponses: ['Summarize this', 'Quiz me', 'Skip section', "I'm fine"],
  };

  const suggestedAction: InterventionAction = {
    type: 'SUGGEST_SESSION',
    data: { action: 'STUDY_HELP', documentId: input.documentId },
  };

  return { detected: true, severity, intervention, suggestedAction };
}

export function detectDistraction(input: DistractionDetectedInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  technique: 'REFocus' | 'BREAK' | 'END_SESSION';
} {
  const { currentPurityScore, purityScoreTrend, pausesInLast10Min, backgroundSwitches } = input;

  // Distraction signals
  const isDistracted = purityScoreTrend === 'DECLINING' || pausesInLast10Min >= 2 || backgroundSwitches >= 3;

  if (!isDistracted) {
    return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'motivational', quickResponses: [] },
      technique: 'REFocus',
    };
  }

  // Determine severity
  let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
  if (currentPurityScore < 50 || pausesInLast10Min >= 4) {
    severity = 'SEVERE';
  } else if (currentPurityScore < 70 || pausesInLast10Min >= 3) {
    severity = 'MODERATE';
  }

  // Determine technique based on severity
  let technique: 'REFocus' | 'BREAK' | 'END_SESSION' = 'REFocus';
  if (severity === 'SEVERE') {
    technique = 'END_SESSION';
  } else if (severity === 'MODERATE') {
    technique = 'BREAK';
  }

  const intervention: InterventionMessage = {
    content: `I noticed your focus wandering — ${pausesInLast10Min} pauses recently. Want to try the REFocus technique, take a short break, or end the session early?`,
    tone: 'supportive',
    quickResponses: ['Try REFocus', 'Take break', 'End early', 'Push through'],
  };

  return { detected: true, severity, intervention, technique };
}

export function detectOptimalBreak(input: OptimalBreakInput): {
  shouldBreak: boolean;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  intervention: InterventionMessage;
  recommendedBreakDuration: number;
} {
  const { sessionDuration, currentPurityScore, focusPattern, timeSinceLastBreak, userPreferredBreakInterval } = input;

  const defaultInterval = 52; // 52/17 rule
  const interval = userPreferredBreakInterval || defaultInterval;

  // Predict fatigue based on patterns
  const timeBased = timeSinceLastBreak >= interval;
  const patternBased = focusPattern === 'FRAGMENTED' || (focusPattern === 'MODERATE' && sessionDuration > 45);
  const purityBased = currentPurityScore < 80 && sessionDuration > 30;

  const shouldBreak = timeBased || patternBased || purityBased;

  if (!shouldBreak) {
    return {
      shouldBreak: false,
      confidence: 'LOW',
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      recommendedBreakDuration: 0,
    };
  }

  // Calculate confidence
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const signals = [timeBased, patternBased, purityBased].filter(Boolean).length;
  if (signals >= 3) {
    confidence = 'HIGH';
  } else if (signals >= 2) {
    confidence = 'MEDIUM';
  }

  // Break duration based on session length
  const recommendedBreakDuration = sessionDuration < 30 ? 5 : sessionDuration < 60 ? 10 : 17;

  const intervention: InterventionMessage = {
    content: `Your focus patterns suggest you're approaching fatigue. A ${recommendedBreakDuration}-minute break now could help you return stronger. Want to take it?`,
    tone: 'supportive',
    quickResponses: ['Take break', '5 more minutes', 'Skip break', 'End session'],
  };

  return { shouldBreak: true, confidence, intervention, recommendedBreakDuration };
}