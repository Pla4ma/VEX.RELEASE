import { z } from "zod";
import { createDebugger } from "../../utils/debug";


export function adjustStudyDifficulty(plan: StudyPlan, averageSessionQuality: number): StudyPlan {
  const difficulties: StudyPlan['difficulty'][] = ['beginner', 'intermediate', 'advanced'];
  const currentIndex = difficulties.indexOf(plan.difficulty);

  let newIndex = currentIndex;

  if (averageSessionQuality > 90 && currentIndex < difficulties.length - 1) {
    newIndex = currentIndex + 1;
  } else if (averageSessionQuality < 60 && currentIndex > 0) {
    newIndex = currentIndex - 1;
  }

  if (newIndex !== currentIndex) {
    return {
      ...plan,
      difficulty: difficulties[newIndex],
    };
  }

  return plan;
}

export function abandonStudyPlan(plan: StudyPlan, reason?: string): StudyPlan {
  debug.info('Study plan %s abandoned: %s', plan.id, reason ?? 'no reason');

  return {
    ...plan,
    status: 'abandoned',
  };
}

export function getStudyInsights(plan: StudyPlan): {
  strongAreas: string[];
  improvementAreas: string[];
  avgSessionDuration: number;
  completionRate: number;
} {
  const completed = plan.sessions.filter((s) => s.completed);

  const avgSessionDuration = completed.length > 0 ? completed.reduce((sum, s) => sum + (s.duration ?? 0), 0) / completed.length : 0;

  const completionRate = (plan.sessionsCompleted / plan.sessionsTotal) * 100;

  return {
    strongAreas: completionRate > 75 ? ['Consistency', 'Focus duration'] : [],
    improvementAreas: completionRate < 50 ? ['Session completion', 'Regular practice'] : [],
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
  const nextSession = getNextSession(plan);

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
    faster: progressA.estimatedMinutesRemaining < progressB.estimatedMinutesRemaining ? planA : planB,
    moreDifficult: difficulties[planA.difficulty] > difficulties[planB.difficulty] ? planA : planB,
    higherCompletion: progressA.completionRate > progressB.completionRate ? planA : planB,
  };
}