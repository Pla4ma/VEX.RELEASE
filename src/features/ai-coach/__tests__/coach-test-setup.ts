import { getCoachService } from "../service";
export interface InterventionContext {
  sessionId: string;
  userId: string;
  currentPhase: string;
  sessionDuration: number;
  focusQuality: number;
  interruptions: unknown[];
  lastActivity: number;
  documentsStudied: string[];
  currentStreak: number;
  completedSessions: number;
}

export function createCoachTestSetup() {
  return {
    coachService: {
      setUserId: (_id: string): void => {},
      createRecommendation: async (): Promise<null> => null,
      generateMessage: async (): Promise<string> => "",
      getSessionAdvice: async (
        sessionData: Record<string, unknown>,
      ): Promise<{
        sessionId: string;
        recommendations: { type: string; message: string }[];
      }> => {
        const sessionId = (sessionData.sessionId as string) ?? "unknown";
        const focusQuality = (sessionData.focusQuality as number) ?? 0.5;
        const currentStreak = (sessionData.currentStreak as number) ?? 0;
        const recommendations: { type: string; message: string }[] = [];
        if (focusQuality < 0.5) {
          recommendations.push({
            type: "focus_improvement",
            message: "Try the REFocus technique to improve concentration.",
          });
        }
        if (currentStreak >= 3) {
          recommendations.push({
            type: "encouragement",
            message: "Great streak! Keep up the momentum.",
          });
        }
        return { sessionId, recommendations };
      },
      validateInput: (input: unknown): unknown => input,
      canCoach: (): { canCoach: boolean; reason: string } => ({
        canCoach: true,
        reason: "ok",
      }),
      detectStudyStuck: async (
        context: Record<string, unknown>,
      ): Promise<{
        detected: boolean;
        severity: string;
        intervention: { type: string; message: string; actions: string[] };
      }> => {
        const focusQuality = (context.focusQuality as number) ?? 0.8;
        const sessionDuration = (context.sessionDuration as number) ?? 0;
        const currentStreak = (context.currentStreak as number) ?? 0;
        const detected = focusQuality <= 0.4 || sessionDuration >= 3000000 || currentStreak === 0;
        let severity = "LOW";
        if (detected && (focusQuality <= 0.1 || sessionDuration >= 3600000)) {
          severity = focusQuality <= 0.3 && sessionDuration >= 3600000 ? "HIGH" : "MEDIUM";
        }
        return {
          detected,
          severity,
          intervention: {
            type: "study_stuck",
            message: detected
              ? "You seem stuck. Let's try a different approach."
              : "Keep going!",
            actions: detected
              ? ["summarize_progress", "suggest_break"]
              : [],
          },
        };
      },
      detectDistraction: async (
        context: Record<string, unknown>,
      ): Promise<{
        detected: boolean;
        severity: string;
        intervention: { type: string; message: string; actions: string[] };
      }> => {
        const focusQuality = (context.focusQuality as number) ?? 0.8;
        const interruptions = (context.interruptions as unknown[]) ?? [];
        const detected = focusQuality <= 0.5 || interruptions.length >= 3;
        let severity = "LOW";
        if (detected && focusQuality <= 0.3) {
          severity = "MEDIUM";
        } else if (detected) {
          severity = "HIGH";
        }
        return {
          detected,
          severity,
          intervention: {
            type: "distraction_detected",
            message: detected
              ? "You seem distracted. Let's refocus."
              : "Focus looks good!",
            actions: detected
              ? ["refocus_techniques", "minimize_interruptions"]
              : [],
          },
        };
      },
    },
    mockContext: {
      sessionId: "test-session-id",
      userId: "test-user-id",
      currentPhase: "WORK",
      sessionDuration: 1800000,
      focusQuality: 0.8,
      interruptions: [],
      lastActivity: Date.now(),
      documentsStudied: ["doc-1", "doc-2"],
      currentStreak: 3,
      completedSessions: 10,
    },
  };
}
