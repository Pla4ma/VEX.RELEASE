import type {
  SessionState,
  InterruptionRecord,
  RecoveryRecord,
  SessionSummary,
  FocusQualityMetrics,
} from "./types";
import type { TimerEngine } from "./engines/TimerEngine";
import type { AntiCheatEngine } from "./antiCheat/AntiCheatEngine";
import type { SessionRepository } from "./repository/SessionRepository";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("session:orchestrator:accessors");

export interface SessionAccessorHost {
  session: SessionState | null;
  isActive: boolean;
  timerEngine: TimerEngine | null;
  antiCheatEngine: AntiCheatEngine;
  interruptions: InterruptionRecord[];
  recoveries: RecoveryRecord[];
  focusMetrics: FocusQualityMetrics;
  userId: string | null;
  lastSessionSummary: SessionSummary | null;
  repository: SessionRepository;
  saveSessionState(): Promise<void>;
}

export function getActiveSession(
  orch: SessionAccessorHost,
): SessionState | null {
  debug.info("getActiveSession");
  return orch.session ? { ...orch.session } : null;
}

export function getTimerState(orch: SessionAccessorHost): unknown {
  return orch.timerEngine?.getState() || null;
}

export function getRemainingSeconds(orch: SessionAccessorHost): number {
  return orch.timerEngine?.getRemainingSeconds() || 0;
}

export function getElapsedSeconds(orch: SessionAccessorHost): number {
  return orch.timerEngine?.getElapsedSeconds() || 0;
}

export function getPercentageComplete(orch: SessionAccessorHost): number {
  return orch.timerEngine?.getPercentageComplete() || 0;
}

export function isSessionActive(orch: SessionAccessorHost): boolean {
  return orch.isActive;
}

export function isPaused(orch: SessionAccessorHost): boolean {
  return orch.session?.status === "PAUSED";
}

export function getCurrentPurityScore(orch: SessionAccessorHost): number {
  return orch.antiCheatEngine.getCurrentPurityScore();
}

export function getPurityLabel(
  orch: SessionAccessorHost,
): "Elite" | "Good" | "Okay" | "Distracted" {
  return orch.antiCheatEngine.getPurityLabel();
}

export function getInterruptions(
  orch: SessionAccessorHost,
): InterruptionRecord[] {
  return [...orch.interruptions];
}

export function getRecoveries(orch: SessionAccessorHost): RecoveryRecord[] {
  return [...orch.recoveries];
}

export function applyStudyQuizBonus(
  orch: SessionAccessorHost,
  correctAnswers: number,
): void {
  if (!orch.session) return;
  orch.session.config = {
    ...orch.session.config,
    quizBonusPoints: Math.max(0, correctAnswers) * 5,
  };
  orch.session.metadata = {
    ...(orch.session.metadata ?? {}),
    studyQuizCorrectAnswers: correctAnswers,
  };
  orch.session.updatedAt = Date.now();
  orch.session.isDirty = true;
  void orch.saveSessionState();
}

export function updateFocusQuality(
  orch: SessionAccessorHost,
  quality: number,
): void {
  if (!orch.session) return;
  orch.focusMetrics.overallScore = Math.max(0, Math.min(100, quality));
  orch.focusMetrics.calculatedAt = Date.now();
  orch.session.updatedAt = Date.now();
  orch.session.isDirty = true;
  void orch.saveSessionState();
}

export function addDocument(
  orch: SessionAccessorHost,
  documentId: string,
): void {
  if (!orch.session) return;
  const docs: string[] = (orch.session.metadata?.documents as string[]) ?? [];
  if (!docs.includes(documentId)) {
    docs.push(documentId);
    orch.session.metadata = {
      ...(orch.session.metadata ?? {}),
      documents: docs,
    };
    orch.session.updatedAt = Date.now();
    orch.session.isDirty = true;
    void orch.saveSessionState();
  }
}

export function removeDocument(
  orch: SessionAccessorHost,
  documentId: string,
): void {
  if (!orch.session) return;
  const docs: string[] = (orch.session.metadata?.documents as string[]) ?? [];
  const updated = docs.filter((id) => id !== documentId);
  orch.session.metadata = {
    ...(orch.session.metadata ?? {}),
    documents: updated,
  };
  orch.session.updatedAt = Date.now();
  orch.session.isDirty = true;
  void orch.saveSessionState();
}

export async function getSessionHistory(
  orch: SessionAccessorHost,
  limit: number = 10,
): Promise<SessionState[]> {
  if (!orch.userId) return [];
  try {
    const history = await orch.repository.getSessionHistory(limit);
    return history.map(
      (entry) =>
        ({
          id: entry.sessionId,
          userId: orch.userId ?? entry.userId,
          config: entry.config as SessionState["config"],
          status: entry.status as SessionState["status"],
          phase: "FOCUS" as const,
          actualDuration: entry.duration ?? 0,
          effectiveDuration: entry.effectiveDuration ?? 0,
          completionPercentage: entry.completionPercentage ?? 0,
          focusQuality: entry.focusQuality ?? 0,
          interruptions: 0,
          pauses: 0,
          pausedTime: 0,
          streakMaintained: entry.streakMaintained ?? false,
          modeBonus: 0,
          baseScore: entry.finalScore ?? 0,
          createdAt: entry.startedAt,
          updatedAt: entry.completedAt ?? entry.startedAt,
        }) as SessionState,
    );
  } catch (err) {
    debug.error(
      "Failed to fetch session history: %s",
      err instanceof Error ? err : new Error(String(err)),
    );
    return [];
  }
}

export function getSessionStats(orch: SessionAccessorHost): {
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  completionRate: number;
} {
  const completed = orch.session?.status === "COMPLETED" ? 1 : 0;
  const duration = orch.session?.actualDuration ?? 0;
  return {
    totalSessions: orch.lastSessionSummary ? 1 : 0,
    totalDuration: Math.floor(duration / 60000),
    averageDuration:
      completed > 0 ? Math.floor(duration / completed / 60000) : 0,
    completionRate: orch.lastSessionSummary ? 100 : 0,
  };
}
