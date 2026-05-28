import { getCoachService } from "../service";
import type { InterventionContext } from "../types";

export function createCoachTestSetup() {
  const coachService = getCoachService();
  coachService.setUserId("test-user-id");

  const mockContext: InterventionContext = {
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
  };

  return { coachService, mockContext };
}
