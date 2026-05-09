import type {
  HomeContextSnapshot,
  HomePrimaryPriority,
} from './priority-schemas';

export function checkFirstSession(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (snapshot.onboarding.isComplete && snapshot.onboarding.firstSessionCompleted) {
    return null;
  }
  return {
    type: 'FIRST_SESSION',
    urgency: 100,
    reason: "You're one session away from building momentum",
    cta: { text: 'Start Your First Session', action: 'START_SESSION', params: { isFirstSession: true } },
  };
}

export function checkStreakCritical(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.streak.isAtRisk) {
    return null;
  }
  const hoursRemaining = snapshot.streak.hoursRemaining ?? 4;
  const urgency = hoursRemaining < 2 ? 95 : hoursRemaining < 4 ? 85 : 75;
  return {
    type: 'STREAK_CRITICAL',
    urgency,
    reason: `Your ${snapshot.streak.currentDays}-day streak expires in ${hoursRemaining} hours`,
    cta: { text: 'Save Your Streak', action: 'VIEW_STREAK' },
  };
}

export function checkBossFinalStrike(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.boss.hasActiveEncounter || !snapshot.boss.isFinalStrike) {
    return null;
  }
  return {
    type: 'BOSS_FINAL_STRIKE',
    urgency: 90,
    reason: 'One more session to defeat the boss',
    cta: { text: 'Defeat Boss', action: 'VIEW_BOSS' },
  };
}

export function checkComeback(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.streak.isComeback) {
    return null;
  }
  return {
    type: 'COMEBACK',
    urgency: 80,
    reason: "You're rebuilding your streak - day 1 matters most",
    cta: { text: 'Start Comeback Session', action: 'START_SESSION', params: { isComeback: true } },
  };
}

export function checkCoachIntervention(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.coach.hasIntervention) {
    return null;
  }
  const hoursRemaining = snapshot.coach.hoursRemaining ?? 4;
  const reason = snapshot.coach.interventionType === 'STREAK_AT_RISK'
    ? 'Your streak is at risk - the AI Coach has a suggestion'
    : 'The AI Coach has personalized guidance for you';
  return {
    type: 'COACH_INTERVENTION',
    urgency: hoursRemaining < 2 ? 75 : 60,
    reason,
    cta: { text: 'View Coach Tip', action: 'VIEW_COACH' },
  };
}

export function checkStudyPlanDue(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.studyPlan.hasActivePlan || !snapshot.studyPlan.dueToday) {
    return null;
  }
  return {
    type: 'STUDY_PLAN_DUE',
    urgency: snapshot.studyPlan.itemsDue > 1 ? 70 : 60,
    reason: `${snapshot.studyPlan.itemsDue} study item${snapshot.studyPlan.itemsDue > 1 ? 's' : ''} due today`,
    cta: { text: 'View Study Plan', action: 'VIEW_STUDY_PLAN' },
  };
}

export function checkDailyGoal(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  const progress = snapshot.daily.minutesFocused / snapshot.daily.goalMinutes;
  if (progress >= 1) {
    return null;
  }
  const remaining = snapshot.daily.goalMinutes - snapshot.daily.minutesFocused;
  const urgency = progress > 0.5 ? 50 : progress > 0.25 ? 40 : 30;
  return {
    type: 'DAILY_GOAL',
    urgency,
    reason: `${Math.ceil(remaining)} minutes to hit your daily goal`,
    cta: { text: 'Continue Session', action: 'START_SESSION' },
  };
}

export function getPriorityCandidates(snapshot: HomeContextSnapshot): HomePrimaryPriority[] {
  return [
    checkFirstSession(snapshot),
    checkStreakCritical(snapshot),
    checkBossFinalStrike(snapshot),
    checkComeback(snapshot),
    checkCoachIntervention(snapshot),
    checkStudyPlanDue(snapshot),
    checkDailyGoal(snapshot),
  ].filter((priority): priority is HomePrimaryPriority => priority !== null);
}
