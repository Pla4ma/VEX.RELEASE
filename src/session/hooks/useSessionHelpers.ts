import { createDebugger } from '../../utils/debug';
import type { SessionConfig, SessionState } from '../types';
import type { SessionActions } from './useSessionActions';

export const debug = createDebugger('hooks:useSession');

export interface UseSessionState {
  session: SessionState | null;
  isActive: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  elapsedSeconds: number;
  completionPercentage: number;
  isLoading: boolean;
  error: Error | null;
}

export interface UseSessionReturn extends UseSessionState, SessionActions {
  refresh: () => void;
}
