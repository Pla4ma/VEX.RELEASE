import type { Progression, XpBreakdown } from './schemas';

export interface AddXpOperationResult {
  success: boolean;
  progression: Progression | null;
  xpAdded: number;
  levelUpOccurred: boolean;
  previousLevel: number;
  newLevel: number;
  breakdown: XpBreakdown;
  rewards: string[];
  error: ProgressionError | null;
  offlineQueued: boolean;
}

export interface ProgressionError {
  code: 'VALIDATION' | 'NETWORK' | 'CONFLICT' | 'UNKNOWN' | 'RATE_LIMIT';
  message: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}
