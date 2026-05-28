import type {
  SessionState,
  SessionPreset,
  SessionSummary,
  SessionHistoryEntry,
} from "./types";
import type {
  SessionStatsResult,
  CreateCustomPresetInput,
} from "./session-service-types";
import type { SessionOrchestrator } from "./SessionOrchestrator";
import { getSessionRepository } from "./repository/SessionRepository";
import { getPresetService } from "./presets";

export type { SessionStatsResult, CreateCustomPresetInput };

/**
 * Read-only query methods for SessionService.
 * Extracted to keep the main class under 200 lines.
 */
export abstract class SessionServiceQueries {
  protected abstract orchestrator: SessionOrchestrator;
  protected abstract repository: ReturnType<typeof getSessionRepository>;
  protected abstract presetService: ReturnType<typeof getPresetService>;

  getCurrentSession(): SessionState | null {
    return this.orchestrator.getSession();
  }

  getActiveSession(): Promise<SessionState | null> {
    return this.repository.getActiveSession();
  }

  isSessionActive(): boolean {
    return this.orchestrator.isSessionActive();
  }

  isSessionPaused(): boolean {
    return this.orchestrator.isPaused();
  }

  getRemainingSeconds(): number {
    return this.orchestrator.getRemainingSeconds();
  }

  getElapsedSeconds(): number {
    return this.orchestrator.getElapsedSeconds();
  }

  getCompletionPercentage(): number {
    return this.orchestrator.getPercentageComplete();
  }

  getCurrentPurityScore(): number {
    return this.orchestrator.getCurrentPurityScore();
  }

  getPurityLabel(): "Elite" | "Good" | "Okay" | "Distracted" {
    return this.orchestrator.getPurityLabel();
  }

  getSessionHistory(limit: number = 100): Promise<SessionHistoryEntry[]> {
    return this.repository.getSessionHistory(limit);
  }

  getSessionById(sessionId: string): Promise<SessionHistoryEntry | null> {
    return this.repository.getSessionById(sessionId);
  }

  getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    return this.repository.getSessionSummary(sessionId);
  }

  getAllSummaries(): Promise<SessionSummary[]> {
    return this.repository.getAllSummaries();
  }

  getSessionStats(): Promise<SessionStatsResult> {
    return this.repository.getSessionStats();
  }

  getAllPresets(): SessionPreset[] {
    return this.presetService.getAllPresets();
  }

  getPresetById(presetId: string): SessionPreset | undefined {
    return this.presetService.getPresetById(presetId);
  }

  async createCustomPreset(
    config: CreateCustomPresetInput,
  ): Promise<SessionPreset> {
    return this.presetService.createCustomPreset(config);
  }

  async deletePreset(presetId: string): Promise<void> {
    return this.presetService.deletePreset(presetId);
  }
}
