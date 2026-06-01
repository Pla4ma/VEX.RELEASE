import type {
  StreakRepairQuest,
  RepairQuestStatusOutput,
} from '../schemas-risk-repair';

export interface RecordSessionResult {
  questUpdated: boolean;
  questCompleted: boolean;
  streakRestored: boolean;
  restoredToDays: number;
}

export interface UseStreakRepairQuestReturn {
  quest: StreakRepairQuest | null;
  status: RepairQuestStatusOutput | null;
  isLoading: boolean;
  isStatusLoading: boolean;
  isCreating: boolean;
  isRecordingSession: boolean;
  error: Error | null;
  statusError: Error | null;
  createError: Error | null;
  recordError: Error | null;
  createQuest: (previousStreak: number) => Promise<void>;
  recordSession: (
    sessionId: string,
    duration: number,
    qualityScore: number,
  ) => Promise<boolean>;
  refetch: () => Promise<void>;
  refetchStatus: () => Promise<void>;
  retry: () => void;
  retryCreate: () => void;
  retryRecord: () => void;
  isEmpty: boolean;
  canStartQuest: boolean;
  progressPercent: number;
  hoursRemaining: number;
}
