import { z } from "zod";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("ai-coach:study-loop");

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

export interface StudySessionResult {
  sessionId: string;
  duration: number;
  quality: number;
  completed: boolean;
  notes?: string;
}

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

export function startStudyPlan(plan: StudyPlan): StudyPlan {
  if (plan.status !== "draft") {
    throw new Error("Can only start plans in draft status");
  }
  return { ...plan, status: "active", startedAt: Date.now() };
}

export function completeStudySession(
  plan: StudyPlan,
  sessionId: string,
  result: StudySessionResult,
): StudyPlan {
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

export function getNextSession(
  plan: StudyPlan,
): StudyPlan["sessions"][0] | null {
  return plan.sessions.find((s) => !s.completed) ?? null;
}

export {
  calculateStudyProgress,
  getStudyStreakMessage,
  needsAttention,
  adjustStudyDifficulty,
  abandonStudyPlan,
  getStudyInsights,
  getNextStudyReminder,
  compareStudyPlans,
} from "./study-loop-analysis";
