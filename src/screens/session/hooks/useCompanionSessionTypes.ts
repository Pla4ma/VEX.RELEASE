import type { SessionSummary } from "../../../session/types";
import type { CompanionState } from "../../../features/companion/types";
import { SessionMode } from "../../../session/modes";

export type UseCompanionSessionInput = {
  currentMode: SessionMode;
  elapsedSeconds: number;
  isPaused: boolean;
  purityScore: number;
  sessionId: string;
  totalSeconds: number;
  userId: string;
};

export type UseCompanionSessionResult = {
  completeCompanionSession: (summary: SessionSummary) => Promise<void>;
  eventLabel: string | null;
  isLoaded: boolean;
  sessionProgress: number;
  state: CompanionState | null;
};
