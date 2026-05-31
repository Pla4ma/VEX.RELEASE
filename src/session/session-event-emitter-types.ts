import type { SessionEventChannels, SessionEventChannel } from './types/events';
import type {
  SessionSummary,
  InterruptionRecord,
  RecoveryRecord,
  AntiCheatFlag,
  SessionState,
} from './types';

export type InterruptionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConflictResolution = 'LOCAL' | 'REMOTE' | 'MERGED';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export interface SessionRewards {
  xp: number;
  coins: number;
  gems: number;
  bonuses: string[];
}

export type Payload<E extends SessionEventChannel> = Omit<
  SessionEventChannels[E],
  'sessionId' | 'userId' | 'timestamp'
>;
export type PartialPayload<E extends SessionEventChannel> = Partial<
  Omit<SessionEventChannels[E], 'sessionId' | 'userId'>
>;
