import type {
  StudyStuckInput, DistractionDetectedInput, OptimalBreakInput,
  StudyBehindInput, BossOpportunityInput, MomentumBuildingInput,
  ComebackReadyInput, StudyPlanCompleteInput,
  InterventionMessage, InterventionAction,
} from './intervention-types';

export function detectStudyStuck(input: StudyStuckInput): {
  detected: boolean; severity: 'MILD' | 'MODERATE' | 'SEVERE'; intervention: InterventionMessage; suggestedAction: InterventionAction;
} {
  const { minutesOnSameSection, documentName, sectionName } = input;
  const isStuck = minutesOnSameSection >= 30;
  if (!isStuck) return { detected: false, severity: 'MILD', intervention: { content: '', tone: 'supportive', quickResponses: [] }, suggestedAction: { type: 'SEND_NOTIFICATION', data: {} } };
  const severity: 'MILD' | 'MODERATE' | 'SEVERE' = minutesOnSameSection >= 60 ? 'SEVERE' : minutesOnSameSection >= 45 ? 'MODERATE' : 'MILD';
  const sectionText = sectionName ? ` on "${sectionName}"` : '';
  return { detected: true, severity, intervention: { content: `You've been on ${documentName}${sectionText} for ${minutesOnSameSection} minutes. Are you stuck? I can help summarize, quiz you, or suggest a different section.`, tone: 'supportive', quickResponses: ['Summarize this', 'Quiz me', 'Skip section', "I'm fine"] }, suggestedAction: { type: 'SUGGEST_SESSION', data: { action: 'STUDY_HELP', documentId: input.documentId } } };
}

export function detectDistraction(input: DistractionDetectedInput): {
  detected: boolean; severity: 'MILD' | 'MODERATE' | 'SEVERE'; intervention: InterventionMessage; technique: 'REFocus' | 'BREAK' | 'END_SESSION';
} {
  const { currentPurityScore, purityScoreTrend, pausesInLast10Min, backgroundSwitches } = input;
  const isDistracted = purityScoreTrend === 'DECLINING' || pausesInLast10Min >= 2 || backgroundSwitches >= 3;
  if (!isDistracted) return { detected: false, severity: 'MILD', intervention: { content: '', tone: 'motivational', quickResponses: [] }, technique: 'REFocus' };
  let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
  if (currentPurityScore < 50 || pausesInLast10Min >= 4) severity = 'SEVERE';
  else if (currentPurityScore < 70 || pausesInLast10Min >= 3) severity = 'MODERATE';
  let technique: 'REFocus' | 'BREAK' | 'END_SESSION' = 'REFocus';
  if (severity === 'SEVERE') technique = 'END_SESSION';
  else if (severity === 'MODERATE') technique = 'BREAK';
  return { detected: true, severity, intervention: { content: `I noticed your focus wandering — ${pausesInLast10Min} pauses recently. Want to try the REFocus technique, take a short break, or end the session early?`, tone: 'supportive', quickResponses: ['Try REFocus', 'Take break', 'End early', 'Push through'] }, technique };
}

export function detectOptimalBreak(input: OptimalBreakInput): {
  shouldBreak: boolean; confidence: 'LOW' | 'MEDIUM' | 'HIGH'; intervention: InterventionMessage; recommendedBreakDuration: number;
} {
  const { sessionDuration, currentPurityScore, focusPattern, timeSinceLastBreak, userPreferredBreakInterval } = input;
  const interval = userPreferredBreakInterval ?? 52;
  const timeBased = timeSinceLastBreak >= interval;
  const patternBased = focusPattern === 'FRAGMENTED' || (focusPattern === 'MODERATE' && sessionDuration > 45);
  const purityBased = currentPurityScore < 80 && sessionDuration > 30;
  const shouldBreak = timeBased || patternBased || purityBased;
  if (!shouldBreak) return { shouldBreak: false, confidence: 'LOW', intervention: { content: '', tone: 'supportive', quickResponses: [] }, recommendedBreakDuration: 0 };
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const signals = [timeBased, patternBased, purityBased].filter(Boolean).length;
  if (signals >= 3) confidence = 'HIGH'; else if (signals >= 2) confidence = 'MEDIUM';
  const breakDuration = sessionDuration < 30 ? 5 : sessionDuration < 60 ? 10 : 17;
  return { shouldBreak: true, confidence, intervention: { content: `Your focus patterns suggest you're approaching fatigue. A ${breakDuration}-minute break now could help you return stronger. Want to take it?`, tone: 'supportive', quickResponses: ['Take break', '5 more minutes', 'Skip break', 'End session'] }, recommendedBreakDuration: breakDuration };
}

export function detectStudyBehind(input: StudyBehindInput): {
  detected: boolean; severity: 'MILD' | 'MODERATE' | 'SEVERE'; intervention: InterventionMessage; suggestedAction: InterventionAction;
} {
  const { daysBehindSchedule } = input;
  const isBehind = daysBehindSchedule >= 2;
  if (!isBehind) return { detected: false, severity: 'MILD', intervention: { content: '', tone: 'supportive', quickResponses: [] }, suggestedAction: { type: 'SEND_NOTIFICATION', data: {} } };
  const severity: 'MILD' | 'MODERATE' | 'SEVERE' = daysBehindSchedule >= 5 ? 'SEVERE' : daysBehindSchedule >= 3 ? 'MODERATE' : 'MILD';
  return { detected: true, severity, intervention: { content: `You're ${daysBehindSchedule} days behind on ${input.planName}. A catch-up session today gets you back on track.`, tone: 'supportive', quickResponses: ['Catch up now', 'Adjust schedule', 'Later', 'Need help'] }, suggestedAction: { type: 'SUGGEST_SESSION', data: { duration: 30, type: 'STUDY_CATCH_UP' } } };
}

export function detectBossOpportunity(input: BossOpportunityInput): {
  detected: boolean; priority: 'LOW' | 'MEDIUM' | 'HIGH'; intervention: InterventionMessage; suggestedAction: InterventionAction;
} {
  const { bossHealthPercent, bossTimeRemaining, currentStreakMultiplier } = input;
  const isOpportunity = bossHealthPercent < 30 && bossTimeRemaining > 0;
  if (!isOpportunity) return { detected: false, priority: 'LOW', intervention: { content: '', tone: 'strategic', quickResponses: [] }, suggestedAction: { type: 'SEND_NOTIFICATION', data: {} } };
  const priority: 'LOW' | 'MEDIUM' | 'HIGH' = bossHealthPercent < 15 ? 'HIGH' : 'MEDIUM';
  return { detected: true, priority, intervention: { content: `Boss is at ${bossHealthPercent}% health! With your ${currentStreakMultiplier}x multiplier, one focused session could finish this.`, tone: 'motivational', quickResponses: ['Attack now', '45-min session', 'View boss', 'Later'] }, suggestedAction: { type: 'SUGGEST_SESSION', data: { duration: 45, type: 'BOSS_KILL', targetQuality: 'S' } } };
}

export function detectMomentumBuilding(input: MomentumBuildingInput): { detected: boolean; intervention: InterventionMessage } {
  const { streakDays, sessionsToday, lastSessionQuality } = input;
  const hasMomentum = streakDays >= 2 && sessionsToday >= 1 && lastSessionQuality >= 70;
  if (!hasMomentum) return { detected: false, intervention: { content: '', tone: 'motivational', quickResponses: [] } };
  return { detected: true, intervention: { content: `${streakDays} days strong! You're building serious momentum. Another session would compound your progress.`, tone: 'motivational', quickResponses: ['Another session', 'Good for today', 'View progress'] } };
}

export function detectComebackReady(input: ComebackReadyInput): {
  detected: boolean; intervention: InterventionMessage; suggestedAction: InterventionAction;
} {
  const { daysSinceStreakBreak, previousStreakLength, hasAttemptedComeback } = input;
  const isComebackWindow = daysSinceStreakBreak >= 1 && daysSinceStreakBreak <= 3 && !hasAttemptedComeback;
  if (!isComebackWindow) return { detected: false, intervention: { content: '', tone: 'supportive', quickResponses: [] }, suggestedAction: { type: 'SEND_NOTIFICATION', data: {} } };
  return { detected: true, intervention: { content: `Ready to restart? Your ${previousStreakLength}-day streak proved you can do this. One easy session begins your comeback.`, tone: 'supportive', quickResponses: ['Comeback session', '15 minutes', 'Not yet'] }, suggestedAction: { type: 'SUGGEST_SESSION', data: { duration: 15, type: 'COMEBACK', bonusMultiplier: 2 } } };
}

export function detectStudyPlanComplete(input: StudyPlanCompleteInput): { detected: boolean; intervention: InterventionMessage } {
  const { totalTasks, completionTimeDays } = input;
  return { detected: true, intervention: { content: `Congratulations! You completed ${input.planName} — ${totalTasks} tasks in ${completionTimeDays} days. That's worth celebrating!`, tone: 'supportive', quickResponses: ['View rewards', 'Start new plan', 'Share progress'] } };
}
