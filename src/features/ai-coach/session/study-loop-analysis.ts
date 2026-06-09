import type { StudyPlan } from './study-loop';

export function getStudyStreakMessage(plan: StudyPlan): string {
  const progress = calculateStudyProgress(plan);
  if (progress.percentage === 0) {
    return `Ready to start your ${plan.sessionsTotal}-session ${plan.subject} plan?`;
  }
  if (progress.percentage === 100) {
    return `Congratulations! You completed your ${plan.subject} study plan!`;
  }
  if (progress.streak >= 3) {
    return `${progress.streak} sessions in a row! Keep the momentum going!`;
  }
  return `${progress.percentage}% complete - ${progress.sessionsRemaining} sessions to go.`;
}

export function calculateStudyProgress(plan: StudyPlan): {
  percentage: number;
  completionRate: number;
  sessionsRemaining: number;
  estimatedMinutesRemaining: number;
  streak: number;
} {
  const percentage = Math.round(
    (plan.sessionsCompleted / plan.sessionsTotal) * 100,
  );
  const sessionsRemaining = plan.sessionsTotal - plan.sessionsCompleted;
  const estimatedMinutesRemaining =
    sessionsRemaining * plan.estimatedMinutesPerSession;
  let streak = 0;
  for (let i = 0; i < plan.sessions.length; i++) {
    if (plan.sessions[i]!.completed) {
      streak++;
    } else {
      break;
    }
  }
  return {
    percentage,
    completionRate: percentage,
    sessionsRemaining,
    estimatedMinutesRemaining,
    streak,
  };
}

export function needsAttention(
  plan: StudyPlan,
  lastSessionAt?: number,
): boolean {
  if (plan.status !== 'active') {
    return false;
  }
  if (lastSessionAt && Date.now() - lastSessionAt > 48 * 60 * 60 * 1000) {
    return true;
  }
  const progress = calculateStudyProgress(plan);
  if (progress.percentage > 80 && progress.sessionsRemaining > 0) {
    return true;
  }
  return false;
}

export function adjustStudyDifficulty(
  plan: StudyPlan,
  averageSessionQuality: number,
): StudyPlan {
  const difficulties: StudyPlan['difficulty'][] = [
    'beginner',
    'intermediate',
    'advanced',
  ];
  const currentIndex = difficulties.indexOf(plan.difficulty);
  let newIndex = currentIndex;
  if (averageSessionQuality > 90 && currentIndex < difficulties.length - 1) {
    newIndex = currentIndex + 1;
  } else if (averageSessionQuality < 60 && currentIndex > 0) {
    newIndex = currentIndex - 1;
  }
  if (newIndex !== currentIndex) {
    return { ...plan, difficulty: difficulties[newIndex]! };
  }
  return plan;
}

export function abandonStudyPlan(plan: StudyPlan, _reason?: string): StudyPlan {
  return { ...plan, status: 'abandoned' };
}

export function getStudyInsights(plan: StudyPlan): {
  strongAreas: string[];
  improvementAreas: string[];
  avgSessionDuration: number;
  completionRate: number;
} {
  const completed = plan.sessions.filter((s) => s.completed);
  const avgSessionDuration =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.duration ?? 0), 0) /
        completed.length
      : 0;
  const completionRate = (plan.sessionsCompleted / plan.sessionsTotal) * 100;
  return {
    strongAreas: completionRate > 75 ? ['Consistency', 'Focus duration'] : [],
    improvementAreas:
      completionRate < 50 ? ['Session completion', 'Regular practice'] : [],
    avgSessionDuration,
    completionRate,
  };
}

export function getNextStudyReminder(plan: StudyPlan): {
  shouldRemind: boolean;
  message: string;
  urgency: 'low' | 'medium' | 'high';
} {
  const progress = calculateStudyProgress(plan);
  const nextSession = plan.sessions.find((s) => !s.completed) ?? null;
  if (!nextSession) {
    return { shouldRemind: false, message: '', urgency: 'low' };
  }
  if (progress.sessionsRemaining === 1) {
    return {
      shouldRemind: true,
      message: `Final session of ${plan.subject}! Complete your plan.`,
      urgency: 'high',
    };
  }
  if (progress.percentage > 75) {
    return {
      shouldRemind: true,
      message: `You are ${progress.percentage}% through your study plan. Keep going!`,
      urgency: 'medium',
    };
  }
  return {
    shouldRemind: true,
    message: `Time for your next ${plan.subject} session.`,
    urgency: 'low',
  };
}

export function compareStudyPlans(
  planA: StudyPlan,
  planB: StudyPlan,
): {
  faster: StudyPlan;
  moreDifficult: StudyPlan;
  higherCompletion: StudyPlan;
} {
  const progressA = calculateStudyProgress(planA);
  const progressB = calculateStudyProgress(planB);
  const difficulties = { beginner: 1, intermediate: 2, advanced: 3 };
  return {
    faster:
      progressA.estimatedMinutesRemaining < progressB.estimatedMinutesRemaining
        ? planA
        : planB,
    moreDifficult:
      difficulties[planA.difficulty] > difficulties[planB.difficulty]
        ? planA
        : planB,
    higherCompletion:
      progressA.completionRate > progressB.completionRate ? planA : planB,
  };
}
