/**
 * Active Intervention Hook (Stub)
 *
 * Moved from root hooks.ts to resolve hooks.ts vs hooks/ coexistence.
 */

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
