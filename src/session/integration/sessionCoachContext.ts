import type { SessionStatus } from "../types";
import type { CoachPresenceContext } from "../../features/coach-presence";

export interface CoachSessionInsight {
  sessionId: string;
  userId: string;
  type: "productivity" | "focus_quality" | "pattern" | "suggestion";
  insight: string;
  actionItems: string[];
  confidence: number;
  generatedAt: number;
}

export interface SessionPattern {
  isComeback: boolean;
  daysSinceLastSession: number;
  successRate: number;
}

export type SessionHistoryEntry = { timestamp: number; status: SessionStatus };

export function analyzeSessionPattern(history: SessionHistoryEntry[]): SessionPattern {
  const lastSession = history[history.length - 1];
  const daysSinceLastSession = lastSession
    ? Math.floor((Date.now() - lastSession.timestamp) / (24 * 60 * 60 * 1000))
    : 0;
  const completed = history.filter((entry) => entry.status === "COMPLETED").length;
  return {
    isComeback: daysSinceLastSession >= 3,
    daysSinceLastSession,
    successRate: history.length > 0 ? completed / history.length : 0,
  };
}

export function getRecentCompletionCount(history: SessionHistoryEntry[]): number {
  const recent = history.slice(-10);
  let count = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i]?.status !== "COMPLETED") break;
    count++;
  }
  return count;
}

export function getRecentAbandonmentCount(history: SessionHistoryEntry[]): number {
  return history.slice(-7).filter((entry) => entry.status === "ABANDONED").length;
}

export function buildCoachPresenceContext(input: {
  sessionMode: CoachPresenceContext["sessionMode"];
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  pattern?: SessionPattern;
}): CoachPresenceContext {
  return {
    motivationStyle: "CALM",
    primaryGoal: "focus",
    firstWeekStage: null,
    latestSession: null,
    memoryConfidence: "none",
    sessionMode: input.sessionMode,
    comebackState: input.pattern?.isComeback ? "missed_2_3_days" : null,
    studyLayerLabel: null,
    bossIntensity: "hidden",
    completionContext: null,
    premiumMoment: "none",
    aiAvailable: false,
  };
}
