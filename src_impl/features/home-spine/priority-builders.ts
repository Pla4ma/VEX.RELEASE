import type {
  HomeContextSnapshot,
  HomePrimaryPriority,
  HomeProgress,
  HomeSecondaryAction,
  HomeStakes,
} from './priority-schemas';

export function buildStakes(
  priority: HomePrimaryPriority,
  snapshot: HomeContextSnapshot
): HomeStakes {
  switch (priority.type) {
    case 'FIRST_SESSION':
      return { what: 'First session completion', atRisk: 'Momentum delay', potentialGain: 'Unlock full app experience' };
    case 'STREAK_CRITICAL':
      return { what: `${snapshot.streak.currentDays}-day streak`, atRisk: 'Streak reset to 0', potentialGain: 'Keep your momentum alive' };
    case 'BOSS_FINAL_STRIKE':
      return { what: 'Boss defeat opportunity', atRisk: 'Boss escapes, no rewards', potentialGain: 'XP, coins, and bragging rights' };
    case 'COMEBACK':
      return { what: 'Streak rebuild in progress', potentialGain: 'Double XP during comeback' };
    case 'COACH_INTERVENTION':
      return { what: 'AI Coach guidance', potentialGain: 'Optimized path to your goal' };
    case 'STUDY_PLAN_DUE':
      return { what: `${snapshot.studyPlan.itemsDue} study items`, atRisk: 'Falling behind schedule', potentialGain: 'Stay on track with your plan' };
    case 'DAILY_GOAL':
      return { what: 'Daily focus goal', potentialGain: 'Build consistent habit' };
    default:
      return { what: 'Daily focus session' };
  }
}

export function buildProgress(snapshot: HomeContextSnapshot): HomeProgress {
  return {
    dailyGoalMinutes: snapshot.daily.goalMinutes,
    streakDays: snapshot.streak.currentDays,
    todayMinutes: snapshot.daily.minutesFocused,
  };
}

function createSecondaryAction(
  type: string,
  title: string
): HomeSecondaryAction {
  return { type, title, onPress: () => undefined };
}

export function buildSecondaryActions(
  sortedPriorities: HomePrimaryPriority[]
): HomeSecondaryAction[] {
  const actions: HomeSecondaryAction[] = [];
  for (const priority of sortedPriorities.slice(1, 4)) {
    if (priority.type === 'STREAK_CRITICAL') {
      actions.push(createSecondaryAction('streak', 'View streak details'));
    }
    if (priority.type === 'BOSS_FINAL_STRIKE') {
      actions.push(createSecondaryAction('boss', 'Check boss health'));
    }
    if (priority.type === 'STUDY_PLAN_DUE') {
      actions.push(createSecondaryAction('study', 'View study plan'));
    }
    if (priority.type === 'COACH_INTERVENTION') {
      actions.push(createSecondaryAction('coach', 'AI Coach tip'));
    }
    if (priority.type === 'COMEBACK') {
      actions.push(createSecondaryAction('comeback', 'Comeback boost active'));
    }
  }
  return actions.slice(0, 3);
}
