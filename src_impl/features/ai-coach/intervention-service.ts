/**
 * Coach Intervention Service
 *
 * Proactive interventions that modify game mechanics based on user state:
 * - Burnout detection: 5+ sessions in 24h with quality < 70
 * - Plateau detection: XP growth dropped >30% over 7 days
 * - Streak rescue: 6 hours before streak breaks
 * - Boss strategy: When boss < 30% health
 *
 * @phase 8
 */

import type { CoachMessage, CoachUserState } from './types';

// ============================================================================
// Types
// ============================================================================

export interface InterventionScenario {
  id: string;
  name: string;
  condition: () => boolean;
  message: InterventionMessage;
  action?: InterventionAction;
}

export interface InterventionMessage {
  content: string;
  tone: 'supportive' | 'urgent' | 'motivational' | 'strategic';
  quickResponses: string[];
}

export interface InterventionAction {
  type: 'SUGGEST_SESSION' | 'AUTO_CREATE_SESSION' | 'SEND_NOTIFICATION';
  data: Record<string, unknown>;
}

export interface BurnoutInput {
  sessionsLast24h: number;
  avgQualityLast24h: number;
  lastSessionCompletedAt: number;
}

export interface PlateauInput {
  xpGrowthRate7d: number; // percentage change vs previous 7d
  xpGrowthRatePrev7d: number;
  currentLevel: number;
  sessionsPerWeekTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface StreakRescueInput {
  streakDays: number;
  hoursUntilStreakBreak: number;
  lastSessionHours: number;
  hasActiveSession: boolean;
}

export interface BossStrategyInput {
  bossHealthPercent: number;
  bossTimeRemaining: number; // hours
  currentStreakMultiplier: number;
  userLevel: number;
}

// ============================================================================
// 8.3 — Burnout Detection
// ============================================================================

/**
 * Detect if user is at risk of burnout
 * Triggers: 5+ sessions in 24 hours AND average quality < 70
 */
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

/**
 * Generate burnout intervention message based on persona
 */
export function generateBurnoutMessage(sessionsLast24h: number, avgQuality: number, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const messages: Record<string, string> = {
    MENTOR: `You've completed ${sessionsLast24h} sessions in 24 hours — impressive dedication. But I've noticed your quality scores averaging ${avgQuality}%. To maintain your streak long-term, consider a shorter, focused session today. Quality over quantity.`,
    CHEERLEADER: `Whoa superstar! 🌟 ${sessionsLast24h} sessions?! You're ON FIRE! But I'm seeing your quality dip to ${avgQuality}%. Let's keep that streak strong with a quick 15-min power session. You've got this!`,
    DRILL_SERGEANT: `Listen up. ${sessionsLast24h} sessions shows discipline, but ${avgQuality}% quality is UNACCEPTABLE. Your streak is at risk. Take a 15-minute focused session. NOW. Quality before ego.`,
  };

  return messages[persona];
}

// ============================================================================
// 8.3 — Plateau Detection
// ============================================================================

/**
 * Detect if user is in a plateau
 * Triggers: XP growth rate dropped >30% over last 7 days
 */
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

/**
 * Generate plateau intervention message based on persona
 */
export function generatePlateauMessage(dropPercent: number, sessionsPerWeekTrend: string, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const trendText = sessionsPerWeekTrend === 'DECREASING' ? 'I also see your session frequency dropping.' : 'Your session count is steady, but intensity is down.';

  const messages: Record<string, string> = {
    MENTOR: `Your XP growth has slowed ${dropPercent.toFixed(0)}% this week. ${trendText} You've hit a plateau — this is normal. To break through, try a longer session at your peak focus time. Growth happens outside comfort zones.`,
    CHEERLEADER: `Hey champ! 📉 I see your XP growth dipped ${dropPercent.toFixed(0)}%. No worries — plateaus happen! ${trendText} Let's CRUSH this with a 60-min powerhouse session. You're stronger than this plateau! 💪`,
    DRILL_SERGEANT: `Your numbers are DROPPING. ${dropPercent.toFixed(0)}% decline. ${trendText} This is complacency. You think you're working hard? You're coasting. 60 minutes. Today. NO EXCUSES.`,
  };

  return messages[persona];
}

// ============================================================================
// 8.3 — Streak Rescue
// ============================================================================

/**
 * Detect if streak rescue is needed
 * Triggers: 6 hours before streak breaks
 */
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

/**
 * Generate streak rescue message with countdown timer
 */
export function generateStreakRescueMessage(streakDays: number, hoursRemaining: number, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const timeText = hoursRemaining <= 2 ? `${hoursRemaining} HOURS` : `${hoursRemaining} hours`;

  const messages: Record<string, string> = {
    MENTOR: `Your ${streakDays}-day streak is at risk. You have ${timeText} remaining. I've analyzed your patterns — a 15-minute session right now will maintain your momentum. Your future self will thank you.`,
    CHEERLEADER: `Oh no! 😱 Your 🔥 ${streakDays}-day streak is about to break! Only ${timeText} left! But don't worry — I'm here! A quick 15-min session saves it all. You can do this! Tap below! 🌟`,
    DRILL_SERGEANT: `DISASTER INCOMING. Your ${streakDays}-day streak breaks in ${timeText}. This is what happens when you procrastinate. 15 minutes. RIGHT NOW. Move.`,
  };

  return messages[persona];
}

// ============================================================================
// 8.3 — Boss Strategy
// ============================================================================

/**
 * Detect if boss strategy tip should be shown
 * Triggers: Boss < 30% health remaining
 */
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

export interface BossStrategy {
  recommendedDuration: number;
  targetQuality: 'S' | 'A' | 'B';
  expectedDamage: number;
}

/**
 * Generate boss strategy message based on context
 */
export function generateBossStrategyMessage(bossHealthPercent: number, timeRemaining: number, streakMultiplier: number, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): string {
  const messages: Record<string, string> = {
    MENTOR: `The boss is near defeat at ${bossHealthPercent.toFixed(0)}% health. With ${timeRemaining} hours remaining and your ${streakMultiplier}x streak multiplier active, a 45-minute S-quality session will deal the killing blow. This is your moment.`,
    CHEERLEADER: `OMG! 🎉 The boss is ALMOST DOWN! ${bossHealthPercent.toFixed(0)}% health left! Your ${streakMultiplier}x streak multiplier is CRUSHING IT! One epic 45-min S-quality session = BOOM! Victory! Let's DO THIS! 👑`,
    DRILL_SERGEANT: `FINISH HIM. ${bossHealthPercent.toFixed(0)}% health. ${timeRemaining} hours. ${streakMultiplier}x multiplier. 45 minutes. S-quality. No pauses. This is what you've trained for. ATTACK.`,
  };

  return messages[persona];
}

// ============================================================================
// Phase 2.3 - New Interventions
// ============================================================================

// New intervention types from Phase 2.3:
// - STUDY_BEHIND: Falling behind study plan
// - BOSS_OPPORTUNITY: Boss health low, good time to attack
// - MOMENTUM_BUILDING: 2+ day streak, encourage continuation
// - COMEBACK_READY: After streak break, optimal time to restart
// - STUDY_PLAN_COMPLETE: Milestone celebration

export interface StudyBehindInput {
  studyPlanProgress: number; // 0-1
  daysBehindSchedule: number;
  planName: string;
}

export interface BossOpportunityInput {
  bossHealthPercent: number;
  bossTimeRemaining: number; // hours
  currentStreakMultiplier: number;
}

export interface MomentumBuildingInput {
  streakDays: number;
  sessionsToday: number;
  lastSessionQuality: number;
}

export interface ComebackReadyInput {
  daysSinceStreakBreak: number;
  previousStreakLength: number;
  hasAttemptedComeback: boolean;
}

export interface StudyPlanCompleteInput {
  planName: string;
  totalTasks: number;
  completionTimeDays: number;
}

// ============================================================================
// Phase 1 - New Intervention Types (19/10 Plan)
// ============================================================================

export interface StudyStuckInput {
  documentId: string;
  documentName: string;
  minutesOnSameSection: number;
  lastInteractionAt: number;
  sectionName?: string;
}

export interface DistractionDetectedInput {
  sessionId: string;
  currentPurityScore: number;
  purityScoreTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  pausesInLast10Min: number;
  backgroundSwitches: number;
}

export interface OptimalBreakInput {
  sessionDuration: number;
  currentPurityScore: number;
  focusPattern: 'DEEP' | 'MODERATE' | 'FRAGMENTED';
  timeSinceLastBreak: number;
  userPreferredBreakInterval?: number;
}

/**
 * Detect if user is stuck on same document section
 * Triggers: 30+ minutes on same section without interaction
 */
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

/**
 * Detect if user is getting distracted during session
 * Triggers: Purity declining, frequent pauses, or background switches
 */
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

/**
 * Detect optimal time for a break
 * Triggers: AI detects focus fatigue patterns before user realizes
 */
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

// ============================================================================
// Original Phase 2.3 Interventions
// ============================================================================

/**
 * Detect if user is falling behind study plan
 * Triggers: 2+ days behind schedule
 */
export function detectStudyBehind(input: StudyBehindInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { daysBehindSchedule } = input;

  const isBehind = daysBehindSchedule >= 2;

  if (!isBehind) {
    return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };
  }

  const severity: 'MILD' | 'MODERATE' | 'SEVERE' = daysBehindSchedule >= 5 ? 'SEVERE' : daysBehindSchedule >= 3 ? 'MODERATE' : 'MILD';

  const intervention: InterventionMessage = {
    content: `You're ${daysBehindSchedule} days behind on ${input.planName}. A catch-up session today gets you back on track.`,
    tone: 'supportive',
    quickResponses: ['Catch up now', 'Adjust schedule', 'Later', 'Need help'],
  };

  const suggestedAction: InterventionAction = {
    type: 'SUGGEST_SESSION',
    data: { duration: 30, type: 'STUDY_CATCH_UP' },
  };

  return { detected: true, severity, intervention, suggestedAction };
}

/**
 * Detect boss opportunity (boss almost defeated)
 * Triggers: Boss health < 30%
 */
export function detectBossOpportunity(input: BossOpportunityInput): {
  detected: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { bossHealthPercent, bossTimeRemaining, currentStreakMultiplier } = input;

  const isOpportunity = bossHealthPercent < 30 && bossTimeRemaining > 0;

  if (!isOpportunity) {
    return {
      detected: false,
      priority: 'LOW',
      intervention: { content: '', tone: 'strategic', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };
  }

  const priority: 'LOW' | 'MEDIUM' | 'HIGH' = bossHealthPercent < 15 ? 'HIGH' : 'MEDIUM';

  const intervention: InterventionMessage = {
    content: `Boss is at ${bossHealthPercent}% health! With your ${currentStreakMultiplier}x multiplier, one focused session could finish this.`,
    tone: 'motivational',
    quickResponses: ['Attack now', '45-min session', 'View boss', 'Later'],
  };

  const suggestedAction: InterventionAction = {
    type: 'SUGGEST_SESSION',
    data: { duration: 45, type: 'BOSS_KILL', targetQuality: 'S' },
  };

  return { detected: true, priority, intervention, suggestedAction };
}

/**
 * Detect momentum building opportunity
 * Triggers: 2+ day streak, already completed session today
 */
export function detectMomentumBuilding(input: MomentumBuildingInput): {
  detected: boolean;
  intervention: InterventionMessage;
} {
  const { streakDays, sessionsToday, lastSessionQuality } = input;

  const hasMomentum = streakDays >= 2 && sessionsToday >= 1 && lastSessionQuality >= 70;

  if (!hasMomentum) {
    return {
      detected: false,
      intervention: { content: '', tone: 'motivational', quickResponses: [] },
    };
  }

  const intervention: InterventionMessage = {
    content: `${streakDays} days strong! You're building serious momentum. Another session would compound your progress.`,
    tone: 'motivational',
    quickResponses: ['Another session', 'Good for today', 'View progress'],
  };

  return { detected: true, intervention };
}

/**
 * Detect comeback opportunity
 * Triggers: 1-3 days after streak break
 */
export function detectComebackReady(input: ComebackReadyInput): {
  detected: boolean;
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { daysSinceStreakBreak, previousStreakLength, hasAttemptedComeback } = input;

  const isComebackWindow = daysSinceStreakBreak >= 1 && daysSinceStreakBreak <= 3 && !hasAttemptedComeback;

  if (!isComebackWindow) {
    return {
      detected: false,
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };
  }

  const intervention: InterventionMessage = {
    content: `Ready to restart? Your ${previousStreakLength}-day streak proved you can do this. One easy session begins your comeback.`,
    tone: 'supportive',
    quickResponses: ['Comeback session', '15 minutes', 'Not yet'],
  };

  const suggestedAction: InterventionAction = {
    type: 'SUGGEST_SESSION',
    data: { duration: 15, type: 'COMEBACK', bonusMultiplier: 2 },
  };

  return { detected: true, intervention, suggestedAction };
}

/**
 * Detect study plan completion milestone
 * Triggers: Study plan just completed
 */
export function detectStudyPlanComplete(input: StudyPlanCompleteInput): {
  detected: boolean;
  intervention: InterventionMessage;
} {
  const { totalTasks, completionTimeDays } = input;

  // This is typically triggered externally when a plan is marked complete
  // For now, always return detected=true when called (external trigger)
  const intervention: InterventionMessage = {
    content: `Congratulations! You completed ${input.planName} — ${totalTasks} tasks in ${completionTimeDays} days. That's worth celebrating!`,
    tone: 'supportive',
    quickResponses: ['View rewards', 'Start new plan', 'Share progress'],
  };

  return { detected: true, intervention };
}

// ============================================================================
// Main Intervention Evaluation
// ============================================================================

/**
 * Evaluate all intervention scenarios and return the highest priority one
 * Updated with Phase 2.3 interventions
 */
export function evaluateInterventions(
  burnoutInput?: BurnoutInput,
  plateauInput?: PlateauInput,
  streakRescueInput?: StreakRescueInput,
  bossStrategyInput?: BossStrategyInput,
  currentPersona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR',
): {
  shouldIntervene: boolean;
  priority: number;
  intervention?: InterventionMessage;
  action?: InterventionAction;
  type: 'BURNOUT' | 'PLATEAU' | 'STREAK_RESCUE' | 'BOSS_STRATEGY' | 'NONE';
} {
  // Priority order: Streak Rescue > Burnout > Boss Strategy > Plateau

  // Check streak rescue first (most urgent)
  if (streakRescueInput) {
    const rescue = detectStreakRescueNeeded(streakRescueInput);
    if (rescue.needsRescue) {
      return {
        shouldIntervene: true,
        priority: rescue.urgency === 'CRITICAL' ? 10 : rescue.urgency === 'HIGH' ? 8 : 6,
        intervention: rescue.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: { duration: rescue.suggestedSessionDuration, type: 'STREAK_RESCUE' },
        },
        type: 'STREAK_RESCUE',
      };
    }
  }

  // Check burnout
  if (burnoutInput) {
    const burnout = detectBurnout(burnoutInput);
    if (burnout.detected) {
      return {
        shouldIntervene: true,
        priority: burnout.severity === 'SEVERE' ? 7 : burnout.severity === 'MODERATE' ? 5 : 3,
        intervention: burnout.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: { duration: burnout.suggestedSessionDuration, type: 'BURNOUT_RECOVERY' },
        },
        type: 'BURNOUT',
      };
    }
  }

  // Check boss strategy
  if (bossStrategyInput) {
    const boss = detectBossStrategyOpportunity(bossStrategyInput);
    if (boss.shouldShow) {
      return {
        shouldIntervene: true,
        priority: boss.priority === 'HIGH' ? 6 : boss.priority === 'MEDIUM' ? 4 : 2,
        intervention: boss.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: {
            duration: boss.strategy.recommendedDuration,
            type: 'BOSS_KILL',
            targetQuality: boss.strategy.targetQuality,
          },
        },
        type: 'BOSS_STRATEGY',
      };
    }
  }

  // Check plateau
  if (plateauInput) {
    const plateau = detectPlateau(plateauInput);
    if (plateau.detected) {
      return {
        shouldIntervene: true,
        priority: plateau.severity === 'SEVERE' ? 5 : plateau.severity === 'MODERATE' ? 3 : 2,
        intervention: plateau.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: { duration: plateau.suggestedSessionDuration, type: 'PLATEAU_BREAKER' },
        },
        type: 'PLATEAU',
      };
    }
  }

  return {
    shouldIntervene: false,
    priority: 0,
    type: 'NONE',
  };
}

export default {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
  evaluateInterventions,
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
};
