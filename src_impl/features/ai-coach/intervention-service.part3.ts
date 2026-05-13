import type { CoachMessage, CoachUserState } from "./types";


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