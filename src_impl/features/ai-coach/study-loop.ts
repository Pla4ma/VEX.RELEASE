/**
 * AI Coach Study Loop
 *
 * Manages study plan creation, tracking, and completion.
 */

import { z } from "zod";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("ai-coach:study-loop");

// Study plan schema
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
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  status: z.enum(["draft", "active", "completed", "abandoned"]),
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

export type StudyPlan = z.infer<typeof StudyPlanSchema>;

// Study session result
export interface StudySessionResult {
  sessionId: string;
  duration: number;
  quality: number;
  completed: boolean;
  notes?: string;
}

// Create new study plan
export async function createStudyPlan(
  userId: string,
  input: {
    title: string;
    description: string;
    subject: string;
    goal: string;
    sessionsTotal: number;
    estimatedMinutesPerSession: number;
    difficulty: StudyPlan["difficulty"];
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
    status: "draft",
    createdAt: now,
    sessions,
  };

  debug.info("Created study plan %s for user %s", plan.id, userId);
  return StudyPlanSchema.parse(plan);
}

// Start study plan
export function startStudyPlan(plan: StudyPlan): StudyPlan {
  if (plan.status !== "draft") {
    throw new Error("Can only start plans in draft status");
  }

  return {
    ...plan,
    status: "active",
    startedAt: Date.now(),
  };
}

// Complete study session
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
    status: isComplete ? "completed" : "active",
    completedAt: isComplete ? Date.now() : plan.completedAt,
  };
}

// Get next incomplete session
export function getNextSession(plan: StudyPlan): StudyPlan["sessions"][0] | null {
  return plan.sessions.find((s) => !s.completed) ?? null;
}

// Calculate study progress
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

// Generate study streak message
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

// Check if study plan needs attention
export function needsAttention(plan: StudyPlan, lastSessionAt?: number): boolean {
  if (plan.status !== "active") {
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

// Adjust study plan difficulty
export function adjustStudyDifficulty(plan: StudyPlan, averageSessionQuality: number): StudyPlan {
  const difficulties: StudyPlan["difficulty"][] = ["beginner", "intermediate", "advanced"];
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

// Abandon study plan
export function abandonStudyPlan(plan: StudyPlan, reason?: string): StudyPlan {
  debug.info("Study plan %s abandoned: %s", plan.id, reason ?? "no reason");

  return {
    ...plan,
    status: "abandoned",
  };
}

// Get study insights
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
    strongAreas: completionRate > 75 ? ["Consistency", "Focus duration"] : [],
    improvementAreas: completionRate < 50 ? ["Session completion", "Regular practice"] : [],
    avgSessionDuration,
    completionRate,
  };
}

// Schedule study reminder
export function getNextStudyReminder(plan: StudyPlan): {
  shouldRemind: boolean;
  message: string;
  urgency: "low" | "medium" | "high";
} {
  const progress = calculateStudyProgress(plan);
  const nextSession = getNextSession(plan);

  if (!nextSession) {
    return { shouldRemind: false, message: "", urgency: "low" };
  }

  if (progress.sessionsRemaining === 1) {
    return {
      shouldRemind: true,
      message: `Final session of ${plan.subject}! Complete your plan.`,
      urgency: "high",
    };
  }

  if (progress.percentage > 75) {
    return {
      shouldRemind: true,
      message: `You are ${progress.percentage}% through your study plan. Keep going!`,
      urgency: "medium",
    };
  }

  return {
    shouldRemind: true,
    message: `Time for your next ${plan.subject} session.`,
    urgency: "low",
  };
}

// Compare study plans
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
