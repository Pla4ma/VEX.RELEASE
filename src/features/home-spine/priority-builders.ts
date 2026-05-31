import type {
  HomeContextSnapshot,
  HomePrimaryPriority,
  HomeProgress,
  HomeSecondaryAction,
  HomeStakes,
} from './priority-schemas';

export function buildStakes(
  priority: HomePrimaryPriority,
  snapshot: HomeContextSnapshot,
): HomeStakes {
  switch (priority.type) {
    case 'STREAK_CRITICAL':
      return {
        atRisk: 'Your streak resets if today ends cold.',
        potentialGain: 'You keep the thread alive with one clean session.',
        what: `${snapshot.streak.currentDays}-day streak`,
      };
    case 'COMPANION_PROMISE':
      return {
        atRisk: 'The promise thread goes quiet if you skip it.',
        potentialGain: 'You keep continuity between yesterday and today.',
        what: 'Companion promise',
      };
    case 'PROMISE_RECOVERY':
      return {
        potentialGain:
          'A small recovery session turns yesterday into context instead of drift.',
        what: 'Recovery session',
      };
    case 'STREAK_AT_RISK':
      return {
        atRisk: 'Momentum weakens if today stays empty.',
        potentialGain:
          'A short session protects the habit before it becomes urgent.',
        what: 'Today’s habit loop',
      };
    case 'RECOMMENDED_SESSION':
      return {
        potentialGain:
          'VEX already found the cleanest next move for this moment.',
        what: 'Recommended session',
      };
    case 'CHALLENGE_NEAR_DONE':
      return {
        atRisk: 'The next focus target stays open.',
        potentialGain:
          'You turn a nearly finished challenge into completed focus time.',
        what: snapshot.challenge.title ?? 'Focus target',
      };
    case 'BOSS_ACTIVE':
      return {
        potentialGain: 'Another focus session becomes visible boss progress.',
        what: 'Focus engine',
      };
    case 'DEFAULT_SESSION':
      return {
        potentialGain: 'A clean start keeps the app honest and calm.',
        what: 'Focus session',
      };
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
  title: string,
): HomeSecondaryAction {
  return { onPress: () => undefined, title, type };
}

export function buildSecondaryActions(
  orderedPriorities: HomePrimaryPriority[],
): HomeSecondaryAction[] {
  const actions = orderedPriorities.slice(1).flatMap((priority) => {
    switch (priority.type) {
      case 'COMPANION_PROMISE':
        return [createSecondaryAction('promise', 'Promise thread is waiting')];
      case 'PROMISE_RECOVERY':
        return [
          createSecondaryAction('recovery', 'Recovery session is available'),
        ];
      case 'STREAK_AT_RISK':
      case 'STREAK_CRITICAL':
        return [createSecondaryAction('streak', 'Review streak status')];
      case 'RECOMMENDED_SESSION':
        return [
          createSecondaryAction(
            'recommendation',
            'See the recommended session',
          ),
        ];
      case 'CHALLENGE_NEAR_DONE':
        return [createSecondaryAction('challenge', 'Start the target session')];
      case 'BOSS_ACTIVE':
        return [createSecondaryAction('boss', 'Turn focus into boss progress')];
      default:
        return [];
    }
  });

  return actions.slice(0, 3);
}
