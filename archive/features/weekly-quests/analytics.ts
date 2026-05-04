import * as Sentry from '@sentry/react-native';

import type { WeeklyQuestState } from './schemas';

export function recordWeeklyQuestProgress(state: WeeklyQuestState): void {
  Sentry.addBreadcrumb({
    category: 'weekly-quests',
    data: {
      completedSteps: state.steps.filter((step) => step.completed).length,
      weekKey: state.weekKey,
    },
    level: 'info',
    message: 'Weekly quest progress recorded',
  });
}

export function captureWeeklyQuestError(error: unknown): void {
  Sentry.captureException(error, { tags: { feature: 'weekly-quests' } });
}
