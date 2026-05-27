export interface EmotionalContext {
  totalSessions: number;
  currentStreak: number;
  hoursSinceLastSession: number | null;
  hasActiveStudyPlan: boolean;
  studyPlanTitle?: string;
  isStreakAtRisk: boolean;
  hasComebackEligible: boolean;
  todaysFocusMinutes: number;
}

export function buildEmotionalReturnReason(context: EmotionalContext): {
  headline: string;
  subtext: string;
  ctaText: string;
  tone: "calm" | "urgent" | "celebratory" | "supportive";
} {
  if (context.totalSessions === 0) {
    return {
      ctaText: "Begin",
      headline: "Start with one small session.",
      subtext: "Focus builds momentum. Momentum builds progress.",
      tone: "calm",
    };
  }
  if (
    context.hasComebackEligible &&
    context.hoursSinceLastSession &&
    context.hoursSinceLastSession > 48
  ) {
    return {
      ctaText: "Return to focus",
      headline: "Momentum comes back with one small session.",
      subtext: "No need to catch up all at once. Start simple.",
      tone: "supportive",
    };
  }
  if (context.hasActiveStudyPlan && context.studyPlanTitle) {
    return {
      ctaText: "Continue studying",
      headline: `Continue your ${context.studyPlanTitle} study plan.`,
      subtext: "Your next step is ready when you are.",
      tone: "calm",
    };
  }
  if (context.isStreakAtRisk && context.currentStreak > 0) {
    return {
      ctaText: "Protect your streak",
      headline: "One session keeps your momentum alive.",
      subtext: `Your ${context.currentStreak}-day streak is within reach.`,
      tone: "urgent",
    };
  }
  if (context.todaysFocusMinutes >= 120) {
    return {
      ctaText: "Start another session",
      headline: "Today's focus goal complete.",
      subtext: "You've built real progress. Rest or continue - your choice.",
      tone: "celebratory",
    };
  }
  if (context.currentStreak > 0) {
    return {
      ctaText: "Continue",
      headline: "Keep building your focus habit.",
      subtext: `${context.currentStreak} days strong. Each session adds to your progress.`,
      tone: "calm",
    };
  }
  return {
    ctaText: "Start session",
    headline: "Your next session is ready.",
    subtext: "Small steps consistently beat perfect plans never started.",
    tone: "calm",
  };
}

export function buildSessionStakesReason(params: {
  mode: "focus" | "study" | "sprint";
  duration: number;
  hasActiveStudyPlan?: boolean;
  streakDays?: number;
  isStreakAtRisk?: boolean;
  bossHealthRemaining?: number;
  challengeProgress?: number;
}): {
  durationText: string;
  reasonText: string;
  outcomeText: string;
} {
  const durationText = `${params.duration}-minute ${params.mode === "study" ? "study" : "focus"} session`;
  if (params.hasActiveStudyPlan) {
    return {
      durationText,
      outcomeText:
        "Completion updates your study progress and builds understanding.",
      reasonText: "Work through your generated study plan.",
    };
  }
  if (params.isStreakAtRisk && params.streakDays && params.streakDays > 0) {
    return {
      durationText,
      outcomeText: `This session keeps your ${params.streakDays}-day streak alive.`,
      reasonText: "Protect your momentum.",
    };
  }
  if (
    params.bossHealthRemaining !== undefined &&
    params.bossHealthRemaining <= 30
  ) {
    return {
      durationText,
      outcomeText:
        "This session brings you closer to completing your current boss.",
      reasonText: "Push forward against today's challenge.",
    };
  }
  if (
    params.challengeProgress !== undefined &&
    params.challengeProgress >= 70
  ) {
    return {
      durationText,
      outcomeText: "You're close to completing today's challenge.",
      reasonText: "Finish what you started today.",
    };
  }
  return {
    durationText,
    outcomeText:
      "Finishing this adds to today's progress and builds your focus habit.",
    reasonText:
      params.mode === "sprint"
        ? "Build momentum with a short burst."
        : "Good for getting back into motion.",
  };
}

export function buildCompletionHeadline(params: {
  sessionDuration: number;
  wasStudySession: boolean;
  streakProtected: boolean;
  streakBroken: boolean;
  bossDamaged: boolean;
  challengeCompleted: boolean;
  dailyGoalComplete: boolean;
}): {
  headline: string;
  subheadline: string;
  tone: "celebratory" | "calm" | "recovery";
} {
  if (params.wasStudySession) {
    return {
      headline: "Study progress locked in.",
      subheadline: "Your effort moved your understanding forward.",
      tone: "calm",
    };
  }
  if (params.dailyGoalComplete) {
    return {
      headline: "Daily goal complete.",
      subheadline:
        "You showed up and followed through. That's the core of progress.",
      tone: "celebratory",
    };
  }
  if (params.challengeCompleted) {
    return {
      headline: "Challenge complete.",
      subheadline: "You finished what you set out to do today.",
      tone: "celebratory",
    };
  }
  if (params.bossDamaged) {
    return {
      headline: "Progress made.",
      subheadline: "You pushed your current challenge forward.",
      tone: "calm",
    };
  }
  if (params.streakProtected) {
    return {
      headline: "Streak protected.",
      subheadline: "You kept your momentum alive today.",
      tone: "calm",
    };
  }
  return {
    headline: "You showed up.",
    subheadline: "One focused session is enough to build momentum.",
    tone: "calm",
  };
}
