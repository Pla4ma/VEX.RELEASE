/**
 * Home Priority Service (Phase 4)
 *
 * Priority selection algorithm for the Home Decision Engine.
 * Home answers "why start now?" in 3 seconds.
 *
 * @phase 4
 */

import {
  HomePrioritySchema,
  HomeContextSnapshotSchema,
  type HomePriority,
  type HomeContextSnapshot,
  type HomePrimaryPriority,
  type HomeSecondaryAction,
  type HomeStakes,
  type HomeProgress,
} from './priority-schemas';

// ============================================================================
// Priority Checkers
// ============================================================================

function checkFirstSession(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (snapshot.onboarding.isComplete && snapshot.onboarding.firstSessionCompleted) {
    return null;
  }

  return {
    type: 'FIRST_SESSION',
    urgency: 100,
    reason: "You're one session away from building momentum",
    cta: {
      text: 'Start Your First Session',
      action: 'START_SESSION',
      params: { isFirstSession: true },
    },
  };
}

function checkStreakCritical(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.streak.isAtRisk) {
    return null;
  }

  const hoursRemaining = snapshot.streak.hoursRemaining ?? 4;
  const urgency = hoursRemaining < 2 ? 95 : hoursRemaining < 4 ? 85 : 75;

  return {
    type: 'STREAK_CRITICAL',
    urgency,
    reason: `Your ${snapshot.streak.currentDays}-day streak expires in ${hoursRemaining} hours`,
    cta: {
      text: 'Save Your Streak',
      action: 'VIEW_STREAK',
    },
  };
}

function checkBossFinalStrike(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.boss.hasActiveEncounter || !snapshot.boss.isFinalStrike) {
    return null;
  }

  return {
    type: 'BOSS_FINAL_STRIKE',
    urgency: 90,
    reason: 'One more session to defeat the boss',
    cta: {
      text: 'Defeat Boss',
      action: 'VIEW_BOSS',
    },
  };
}

function checkComeback(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.streak.isComeback) {
    return null;
  }

  return {
    type: 'COMEBACK',
    urgency: 80,
    reason: "You're rebuilding your streak - day 1 matters most",
    cta: {
      text: 'Start Comeback Session',
      action: 'START_SESSION',
      params: { isComeback: true },
    },
  };
}

function checkCoachIntervention(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.coach.hasIntervention) {
    return null;
  }

  const hoursRemaining = snapshot.coach.hoursRemaining ?? 4;
  const urgency = hoursRemaining < 2 ? 75 : 60;

  return {
    type: 'COACH_INTERVENTION',
    urgency,
    reason: snapshot.coach.interventionType === 'STREAK_AT_RISK'
      ? 'Your streak is at risk - the AI Coach has a suggestion'
      : 'The AI Coach has personalized guidance for you',
    cta: {
      text: 'View Coach Tip',
      action: 'VIEW_COACH',
    },
  };
}

function checkStudyPlanDue(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
  if (!snapshot.studyPlan.hasActivePlan || !snapshot.studyPlan.dueToday) {
    return null;
  }

  return {
    type: 'STUDY_PLAN_DUE',
    urgency: snapshot.studyPlan.itemsDue > 1 ? 70 : 60,
    reason: `${snapshot.studyPlan.itemsDue} study item${snapshot.studyPlan.itemsDue > 1 ? 's' : ''} due today`,
    cta: {
      text: 'View Study Plan',
      action: 'VIEW_STUDY_PLAN',
    },
  };
}

function checkDailyGoal(snapshot: HomeContextSnapshot): HomePrimaryPriority | null {
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
    cta: {
      text: 'Continue Session',
      action: 'START_SESSION',
    },
  };
}

// ============================================================================
// Stakes Builder
// ============================================================================

function buildStakes(priority: HomePrimaryPriority, snapshot: HomeContextSnapshot): HomeStakes {
  switch (priority.type) {
    case 'FIRST_SESSION':
      return {
        what: 'First session completion',
        atRisk: 'Momentum delay',
        potentialGain: 'Unlock full app experience',
      };

    case 'STREAK_CRITICAL':
      return {
        what: `${snapshot.streak.currentDays}-day streak`,
        atRisk: 'Streak reset to 0',
        potentialGain: 'Keep your momentum alive',
      };

    case 'BOSS_FINAL_STRIKE':
      return {
        what: 'Boss defeat opportunity',
        atRisk: 'Boss escapes, no rewards',
        potentialGain: 'XP, coins, and bragging rights',
      };

    case 'COMEBACK':
      return {
        what: 'Streak rebuild in progress',
        potentialGain: 'Double XP during comeback',
      };

    case 'COACH_INTERVENTION':
      return {
        what: 'AI Coach guidance',
        potentialGain: 'Optimized path to your goal',
      };

    case 'STUDY_PLAN_DUE':
      return {
        what: `${snapshot.studyPlan.itemsDue} study items`,
        atRisk: 'Falling behind schedule',
        potentialGain: 'Stay on track with your plan',
      };

    case 'DAILY_GOAL':
      return {
        what: 'Daily focus goal',
        potentialGain: 'Build consistent habit',
      };

    default:
      return { what: 'Daily focus session', atRisk: undefined, potentialGain: undefined };
  }
}

// ============================================================================
// Progress Builder
// ============================================================================

function buildProgress(snapshot: HomeContextSnapshot): HomeProgress {
  return {
    todayMinutes: snapshot.daily.minutesFocused,
    dailyGoalMinutes: snapshot.daily.goalMinutes,
    streakDays: snapshot.streak.currentDays,
  };
}

// ============================================================================
// Secondary Actions Builder
// ============================================================================

function buildSecondaryActions(
  sortedPriorities: HomePrimaryPriority[],
  snapshot: HomeContextSnapshot
): HomeSecondaryAction[] {
  const actions: HomeSecondaryAction[] = [];

  for (const priority of sortedPriorities.slice(1, 4)) {
    switch (priority.type) {
      case 'STREAK_CRITICAL':
        actions.push({
          type: 'streak',
          title: 'View streak details',
          onPress: () => {}, // Navigation handled by consumer
        });
        break;

      case 'BOSS_FINAL_STRIKE':
        actions.push({
          type: 'boss',
          title: 'Check boss health',
          onPress: () => {},
        });
        break;

      case 'STUDY_PLAN_DUE':
        actions.push({
          type: 'study',
          title: 'View study plan',
          onPress: () => {},
        });
        break;

      case 'COACH_INTERVENTION':
        actions.push({
          type: 'coach',
          title: 'AI Coach tip',
          onPress: () => {},
        });
        break;

      case 'COMEBACK':
        actions.push({
          type: 'comeback',
          title: 'Comeback boost active',
          onPress: () => {},
        });
        break;

      default:
        break;
    }
  }

  return actions.slice(0, 3);
}

// ============================================================================
// Context Snapshot Builder
// ============================================================================

async function buildHomeContextSnapshot(userId: string): Promise<HomeContextSnapshot> {
  // Parallel fetch all required data
  const [
    { onboardingRepository },
    { fetchStreak },
    { fetchActiveEncounter },
  ] = await Promise.all([
    import('../onboarding/repository'),
    import('../streaks/repository'),
    import('../boss/repository'),
  ]);

  const [progressState, streak, bossEncounter] = await Promise.all([
    onboardingRepository.getProgress(userId),
    fetchStreak(userId).catch(() => null),
    fetchActiveEncounter(userId).catch(() => null),
  ]);

  // Build snapshot
  const now = Date.now();
  const dailyGoalMinutes = 60; // Default daily goal
  const minutesFocused = 0; // Would come from daily stats repository

  const snapshot = {
    userId,
    timestamp: now,

    onboarding: {
      isComplete: progressState?.status === 'COMPLETED' ?? false,
      firstSessionCompleted: progressState?.steps.firstSessionCompleted ?? false,
    },

    streak: {
      currentDays: streak?.currentDays ?? 0,
      isAtRisk: streak ? calculateStreakAtRisk(streak) : false,
      hoursRemaining: streak ? calculateHoursRemaining(streak) : undefined,
      isComeback: false, // Would need separate comeback tracking
    },

    boss: {
      hasActiveEncounter: !!bossEncounter && bossEncounter.status === 'ACTIVE',
      healthRemaining: bossEncounter?.healthRemaining,
      maxHealth: bossEncounter?.maxHealth,
      isFinalStrike: bossEncounter
        ? (bossEncounter.healthRemaining / bossEncounter.maxHealth) < 0.2
        : false,
    },

    studyPlan: {
      hasActivePlan: false, // Would fetch from study plan repository
      dueToday: false,
      itemsDue: 0,
    },

    coach: {
      hasIntervention: false, // Would fetch from coach service
      interventionType: undefined,
      hoursRemaining: undefined,
    },

    daily: {
      minutesFocused,
      goalMinutes: dailyGoalMinutes,
      sessionsCompleted: 0, // Would come from daily stats
    },
  };

  return HomeContextSnapshotSchema.parse(snapshot);
}

// ============================================================================
// Streak Helpers
// ============================================================================

function calculateStreakAtRisk(streak: { lastQualifyingSessionAt: number | null; shieldsAvailable: number }): boolean {
  if (!streak.lastQualifyingSessionAt) {
    return false;
  }

  const lastSession = new Date(streak.lastQualifyingSessionAt).getTime();
  const now = Date.now();
  const hoursSinceLastSession = (now - lastSession) / (1000 * 60 * 60);

  // At risk if > 20 hours since last session and no shields
  return hoursSinceLastSession > 20 && streak.shieldsAvailable === 0;
}

function calculateHoursRemaining(streak: { lastQualifyingSessionAt: number | null }): number {
  if (!streak.lastQualifyingSessionAt) {
    return 24;
  }

  const lastSession = new Date(streak.lastQualifyingSessionAt).getTime();
  const nextDeadline = lastSession + 24 * 60 * 60 * 1000;
  const hoursRemaining = Math.max(0, (nextDeadline - Date.now()) / (1000 * 60 * 60));

  return Math.floor(hoursRemaining);
}

// ============================================================================
// Main Priority Selection
// ============================================================================

export async function selectHomePriority(userId: string): Promise<HomePriority> {
  const snapshot = await buildHomeContextSnapshot(userId);

  const candidates = [
    checkFirstSession(snapshot),
    checkStreakCritical(snapshot),
    checkBossFinalStrike(snapshot),
    checkComeback(snapshot),
    checkCoachIntervention(snapshot),
    checkStudyPlanDue(snapshot),
    checkDailyGoal(snapshot),
  ].filter((p): p is HomePrimaryPriority => p !== null);

  // Sort by urgency (descending)
  const sorted = candidates.sort((a, b) => b.urgency - a.urgency);

  const primary = sorted[0] ?? checkDailyGoal(snapshot)!;

  return HomePrioritySchema.parse({
    primary,
    stakes: buildStakes(primary, snapshot),
    progress: buildProgress(snapshot),
    secondary: buildSecondaryActions(sorted, snapshot),
  });
}
