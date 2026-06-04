import type {
  StudyBehindInput,
  BossOpportunityInput,
  MomentumBuildingInput,
  ComebackReadyInput,
  StudyPlanCompleteInput,
  InterventionMessage,
  InterventionAction,
} from './intervention-types';

export function detectStudyBehind(input: StudyBehindInput): {
  detected: boolean;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { daysBehindSchedule } = input;
  const isBehind = daysBehindSchedule >= 2;
  if (!isBehind)
    {return {
      detected: false,
      severity: 'MILD',
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };}
  const severity: 'MILD' | 'MODERATE' | 'SEVERE' =
    daysBehindSchedule >= 5
      ? 'SEVERE'
      : daysBehindSchedule >= 3
        ? 'MODERATE'
        : 'MILD';
  return {
    detected: true,
    severity,
    intervention: {
      content: `You're ${daysBehindSchedule} days behind on ${input.planName}. A catch-up session today gets you back on track.`,
      tone: 'supportive',
      quickResponses: ['Catch up now', 'Adjust schedule', 'Later', 'Need help'],
    },
    suggestedAction: {
      type: 'SUGGEST_SESSION',
      data: { duration: 30, type: 'STUDY_CATCH_UP' },
    },
  };
}

export function detectBossOpportunity(input: BossOpportunityInput): {
  detected: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { bossHealthPercent, bossTimeRemaining, currentStreakMultiplier } =
    input;
  const isOpportunity = bossHealthPercent < 30 && bossTimeRemaining > 0;
  if (!isOpportunity)
    {return {
      detected: false,
      priority: 'LOW',
      intervention: { content: '', tone: 'strategic', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };}
  const priority: 'LOW' | 'MEDIUM' | 'HIGH' =
    bossHealthPercent < 15 ? 'HIGH' : 'MEDIUM';
  return {
    detected: true,
    priority,
    intervention: {
      content: `Boss is at ${bossHealthPercent}% health! With your ${currentStreakMultiplier}x multiplier, one focused session could finish this.`,
      tone: 'motivational',
      quickResponses: ['Attack now', '45-min session', 'View boss', 'Later'],
    },
    suggestedAction: {
      type: 'SUGGEST_SESSION',
      data: { duration: 45, type: 'BOSS_KILL', targetQuality: 'S' },
    },
  };
}

export function detectMomentumBuilding(input: MomentumBuildingInput): {
  detected: boolean;
  intervention: InterventionMessage;
} {
  const { streakDays, sessionsToday, lastSessionQuality } = input;
  const hasMomentum =
    streakDays >= 2 && sessionsToday >= 1 && lastSessionQuality >= 70;
  if (!hasMomentum)
    {return {
      detected: false,
      intervention: { content: '', tone: 'motivational', quickResponses: [] },
    };}
  return {
    detected: true,
    intervention: {
      content: `${streakDays} days strong! You're building serious momentum. Another session would compound your progress.`,
      tone: 'motivational',
      quickResponses: ['Another session', 'Good for today', 'View progress'],
    },
  };
}

export function detectComebackReady(input: ComebackReadyInput): {
  detected: boolean;
  intervention: InterventionMessage;
  suggestedAction: InterventionAction;
} {
  const { daysSinceStreakBreak, previousStreakLength, hasAttemptedComeback } =
    input;
  const isComebackWindow =
    daysSinceStreakBreak >= 1 &&
    daysSinceStreakBreak <= 3 &&
    !hasAttemptedComeback;
  if (!isComebackWindow)
    {return {
      detected: false,
      intervention: { content: '', tone: 'supportive', quickResponses: [] },
      suggestedAction: { type: 'SEND_NOTIFICATION', data: {} },
    };}
  return {
    detected: true,
    intervention: {
      content: `Ready to restart? Your ${previousStreakLength}-day streak proved you can do this. One easy session begins your comeback.`,
      tone: 'supportive',
      quickResponses: ['Comeback session', '15 minutes', 'Not yet'],
    },
    suggestedAction: {
      type: 'SUGGEST_SESSION',
      data: { duration: 15, type: 'COMEBACK', bonusMultiplier: 2 },
    },
  };
}

export function detectStudyPlanComplete(input: StudyPlanCompleteInput): {
  detected: boolean;
  intervention: InterventionMessage;
} {
  const { totalTasks, completionTimeDays } = input;
  return {
    detected: true,
    intervention: {
      content: `Congratulations! You completed ${input.planName} — ${totalTasks} tasks in ${completionTimeDays} days. That's worth celebrating!`,
      tone: 'supportive',
      quickResponses: ['View rewards', 'Start new plan', 'Share progress'],
    },
  };
}
