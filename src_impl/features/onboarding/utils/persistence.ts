import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Onboarding Persistence Utilities
 *
 * Handles saving and recovering incomplete onboarding progress.
 * Critical for users who leave mid-onboarding.
 *
 * @phase 2 - Deepening: Persistence layer
 */

import { MMKV } from 'react-native-mmkv';
import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';
import type { OnboardingState, OnboardingStep, FocusGoal, FocusDuration } from '../schemas';

const debug = createDebugger('onboarding:persistence');

// ============================================================================
// Storage Instance
// ============================================================================

const storage = new MMKV({
  id: 'onboarding-persistence',
  encryptionKey: 'onboarding-secure-storage',
});

// ============================================================================
// Schemas
// ============================================================================

const PersistedOnboardingStateSchema = z.object({
  isOnboarded: z.boolean(),
  currentStep: z.number().min(0).max(4),
  goal: z.enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL']).nullable(),
  focusDuration: z
    .number()
    .refine((val): val is FocusDuration => [15, 25, 45, 60].includes(val))
    .nullable(),
  displayName: z.string().min(2).max(30).nullable(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
  lastUpdatedAt: z.number(),
  version: z.number().default(1),
});

type PersistedOnboardingState = z.infer<typeof PersistedOnboardingStateSchema>;

// ============================================================================
// Keys
// ============================================================================

const KEYS = {
  ONBOARDING_STATE: 'onboarding:state',
  INCOMPLETE_BACKUP: 'onboarding:incomplete_backup',
  ABANDON_COUNT: 'onboarding:abandon_count',
  COMPLETION_ATTEMPTS: 'onboarding:completion_attempts',
  LAST_STEP_ABANDONED: 'onboarding:last_step_abandoned',
} as const;

// ============================================================================
// Core Functions
// ============================================================================
// ============================================================================
// Recovery
// ============================================================================

function recoverFromBackup(): OnboardingState | null {
  try {
    const data = storage.getString(KEYS.INCOMPLETE_BACKUP);

    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    const validated = PersistedOnboardingStateSchema.parse(parsed);

    const state: OnboardingState = {
      isOnboarded: validated.isOnboarded,
      currentStep: validated.currentStep,
      goal: validated.goal,
      focusDuration: validated.focusDuration,
      displayName: validated.displayName,
      startedAt: validated.startedAt,
      completedAt: validated.completedAt,
    };

    debug.info('Onboarding state recovered from backup', { step: state.currentStep });

    eventBus.publish('analytics:track', {
      event: 'onboarding_recovered_from_backup',
      properties: { step: state.currentStep },
    });

    return state;
  } catch (error) {
    debug.error('Failed to recover from backup', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

// ============================================================================
// Abandon Tracking
// ============================================================================

interface AbandonRecord {
  step: number;
  timestamp: number;
  partialData: Partial<OnboardingState>;
}

// ============================================================================
// Completion Tracking
// ============================================================================
// ============================================================================
// Progress Recovery
// ============================================================================
// ============================================================================
// Export
// ============================================================================
export default OnboardingPersistence;

export * from "./persistence.types";
export * from "./persistence.part1";
export * from "./persistence.part2";
