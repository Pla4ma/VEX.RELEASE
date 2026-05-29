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
      getSessionAdvice: async (): Promise<null> => null,
      validateInput: (input: unknown): unknown => input,
      canCoach: (): { canCoach: boolean; reason: string } => ({
        canCoach: true,
        reason: "ok",
      }),
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
