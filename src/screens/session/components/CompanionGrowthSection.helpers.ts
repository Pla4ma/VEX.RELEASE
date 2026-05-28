import type { SessionSummary } from "../../../session/types";
import {
  type CompanionGrowth,
  getEvolutionProgress,
  getMoodForSessionSummary,
  loadCompanionState,
} from "../../../features/companion/session-storage";

export type LoadState =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "empty" }
  | { status: "success"; growth: CompanionGrowth };

export async function buildFallbackGrowth(
  sessionId: string,
  summary: SessionSummary,
  userId: string,
): Promise<CompanionGrowth> {
  const state = await loadCompanionState(userId);
  return {
    sessionId,
    mood: getMoodForSessionSummary(summary),
    level: state.level,
    phase: state.phase,
    progressToEvolution: getEvolutionProgress(state),
    totalFocusMinutes: state.totalFocusMinutes,
    leveledUp: false,
    evolved: false,
    updatedAt: Date.now(),
  };
}
