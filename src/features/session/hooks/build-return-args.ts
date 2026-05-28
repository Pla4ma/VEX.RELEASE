import type { QueryClient } from "@tanstack/react-query";
import type { SessionConfig, SessionState } from "../../../session/types";
import type { SessionOrchestrator } from "../../../session/SessionOrchestrator";
import type { getCoachService } from "../../ai-coach/service";

export interface BuildReturnArgs {
  queryClient: QueryClient;
  orchestrator: SessionOrchestrator;
  coachService: ReturnType<typeof getCoachService>;
  sessionConfig: SessionConfig | null;
  setSessionConfig: (config: SessionConfig | null) => void;
  currentSessionQuery: {
    data: SessionState | null | undefined;
    error: Error | null;
    isLoading: boolean;
    isFetching: boolean;
  };
  sessionHistoryQuery: {
    data: SessionState[] | undefined;
    error: Error | null;
    isLoading: boolean;
    isFetching: boolean;
  };
  sessionStatsQuery: {
    data: unknown;
    error: Error | null;
    isLoading: boolean;
    isFetching: boolean;
  };
  activeSessionQuery: {
    data: SessionState | null | undefined;
    error: Error | null;
    isLoading: boolean;
    isFetching: boolean;
  };
  startSessionMutation: {
    isPending: boolean;
    mutate: (config: SessionConfig) => void;
  };
  pauseSessionMutation: { isPending: boolean; mutate: () => void };
  resumeSessionMutation: { isPending: boolean; mutate: () => void };
  endSessionMutation: { isPending: boolean; mutate: (reason?: string) => void };
}
