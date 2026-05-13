import { z } from "zod";
import { createDebugger } from "../../utils/debug";


export const StudyPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  goal: z.string(),
  sessionsTotal: z.number(),
  sessionsCompleted: z.number(),
  estimatedMinutesPerSession: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'active', 'completed', 'abandoned']),
  createdAt: z.number(),
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  sessions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
      completedAt: z.number().optional(),
      duration: z.number().optional(),
    }),
  ),
});

export async function createStudyPlan(
  userId: string,
  input: {
    title: string;
    description: string;
    subject: string;
    goal: string;
    sessionsTotal: number;
    estimatedMinutesPerSession: number;
    difficulty: StudyPlan['difficulty'];
  },
): Promise<StudyPlan> {
  const now = Date.now();
  const sessions = Array.from({ length: input.sessionsTotal }, (_, i) => ({
    id: `session-${i + 1}`,
    title: `Session ${i + 1}: ${input.subject} - Part ${i + 1}`,
    completed: false,
  }));

  const plan: StudyPlan = {
    id: `plan-${userId}-${now}`,
    userId,
    title: input.title,
    description: input.description,
    subject: input.subject,
    goal: input.goal,
    sessionsTotal: input.sessionsTotal,
    sessionsCompleted: 0,
    estimatedMinutesPerSession: input.estimatedMinutesPerSession,
    difficulty: input.difficulty,
    status: 'draft',
    createdAt: now,
    sessions,
  };

  debug.info('Created study plan %s for user %s', plan.id, userId);
  return StudyPlanSchema.parse(plan);
}

export function startStudyPlan(plan: StudyPlan): StudyPlan {
  if (plan.status !== 'draft') {
    throw new Error('Can only start plans in draft status');
  }

  return {
    ...plan,
    status: 'active',
    startedAt: Date.now(),
  };
}

export function completeStudySession(plan: StudyPlan, sessionId: string, result: StudySessionResult): StudyPlan {
  const sessions = plan.sessions.map((s) => {
    if (s.id === sessionId) {
      return {
        ...s,
        completed: true,
        completedAt: Date.now(),
        duration: result.duration,
      };
    }
    return s;
  });

  const completedCount = sessions.filter((s) => s.completed).length;
  const isComplete = completedCount >= plan.sessionsTotal;

  return {
    ...plan,
    sessions,
    sessionsCompleted: completedCount,
    status: isComplete ? 'completed' : 'active',
    completedAt: isComplete ? Date.now() : plan.completedAt,
  };
}

export function getNextSession(plan: StudyPlan): StudyPlan['sessions'][0] | null {
  return plan.sessions.find((s) => !s.completed) ?? null;
}

export function calculateStudyProgress(plan: StudyPlan): {
  percentage: number;
  completionRate: number;
  sessionsRemaining: number;
  estimatedMinutesRemaining: number;
  streak: number;
} {
  const percentage = Math.round((plan.sessionsCompleted / plan.sessionsTotal) * 100);
  const sessionsRemaining = plan.sessionsTotal - plan.sessionsCompleted;
  const estimatedMinutesRemaining = sessionsRemaining * plan.estimatedMinutesPerSession;

  // Calculate current streak (consecutive completed sessions)
  let streak = 0;
  for (let i = 0; i < plan.sessions.length; i++) {
    if (plan.sessions[i].completed) {
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

export function needsAttention(plan: StudyPlan, lastSessionAt?: number): boolean {
  if (plan.status !== 'active') {
    return false;
  }

  // Check if incomplete and hasn't been worked on in 48 hours
  if (lastSessionAt && Date.now() - lastSessionAt > 48 * 60 * 60 * 1000) {
    return true;
  }

  // Check if near completion but stalled
  const progress = calculateStudyProgress(plan);
  if (progress.percentage > 80 && progress.sessionsRemaining > 0) {
    return true;
  }

  return false;
}