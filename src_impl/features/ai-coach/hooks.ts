/**
 * AI Coach Hooks - Barrel Export
 *
 * Re-exports all hooks from the hooks/ directory.
 * This file exists for backward compatibility.
 */

export * from './hooks';
export {
  useCoachState,
  type UseCoachStateResult,
} from './hooks/useCoachState';
export {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from './hooks/useRecommendationMutations';

// Stub for ActiveIntervention type and useActiveIntervention hook
export interface ActiveIntervention {
  id: string;
  type: 'STREAK_RISK' | 'BURNOUT' | 'PLATEAU' | 'BOSS_FINISH';
  message: string;
  actionLabel: string;
  priority: number;
  hoursRemaining?: number;
  metadata: Record<string, unknown>;
}

export function useActiveIntervention(_userId?: string): {
  intervention: ActiveIntervention | null;
  data: ActiveIntervention | null;
  isLoading: boolean;
  dismiss: (interventionId: string) => void;
} {
  const intervention = null;
  return {
    intervention,
    data: intervention,
    isLoading: false,
    dismiss: (_interventionId: string): void => {},
  };
}
