import { captureSilentFailure } from "../../utils/silent-failure";
import * as repository from "./repository";
import { GenerateMessageInputSchema, EvaluateInterventionsInputSchema, MarkMessageActionInputSchema, type CoachMessageTemplate, type CoachMessage, type InterventionRule, type InterventionExecution, type MessageCategory, type TriggerType, type DeliveryMethod, type GenerateMessageInput, type EvaluateInterventionsInput, type MarkMessageActionInput } from "./schemas";
import { getOrCreateCoachState, updateCoachState } from "./persona-manager";
import { generateCoachMessage, generateSessionSummary } from "../../shared/ai/edge-function-service";
import { getSessionRepository } from "../../session/repository/SessionRepository";
import { getRelevantMemories, generateMemoryReferenceMessage, type MemoryType, getMilestoneSummary } from "./CoachMemory";
import { validateMessageQuality, type MessageQualityAnalysis, MessageQualityElements } from "../../../src/features/ai-coach/message-quality-gate";


export async function generatePerformanceSummary(
  userId: string,
  period: 'daily' | 'weekly' | 'monthly',
): Promise<{
  period: string;
  sessionsCompleted: number;
  totalFocusTime: number;
  averageQuality: number;
  streakDays: number;
  xpEarned: number;
  coachMessage: string;
}> {
  const state = await getOrCreateCoachState(userId);
  const sessionRepository = getSessionRepository(userId);
  const stats = await sessionRepository.getSessionStats();
  const summaries = await sessionRepository.getAllSummaries();
  const averageQuality = summaries.length > 0 ? summaries.reduce((sum, summary) => sum + summary.focusQuality, 0) / summaries.length : 0;
  const xpEarned = summaries.reduce((sum, item) => sum + (item.xpEarned ?? 0), 0);

  const summary = {
    period,
    sessionsCompleted: stats.completedSessions,
    totalFocusTime: stats.totalFocusTime,
    averageQuality,
    streakDays: stats.currentStreak,
    xpEarned,
    coachMessage: await generateAISummaryMessage(
      userId,
      period,
      {
        sessionCount: stats.completedSessions,
        totalFocusMinutes: Math.round(stats.totalFocusTime / 60),
        averageQuality,
        streakDays: stats.currentStreak,
        xpEarned,
        challengesCompleted: 0,
      },
      state.currentState,
    ),
  };

  return summary;
}