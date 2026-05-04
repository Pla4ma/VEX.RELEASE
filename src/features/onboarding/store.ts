import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Onboarding Store
 *
 * Zustand store for onboarding state management.
 * Persisted to MMKV for cross-session state.
 * @phase 2
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { OnboardingState, FocusGoal, FocusDuration } from './schemas';
import { OnboardingStateSchema } from './schemas';

/**
 * Initial onboarding state
 */
const initialState: OnboardingState = {
  isOnboarded: false,
  currentStep: 0,
  goal: null,
  focusDuration: null,
  displayName: null,
  startedAt: null,
  completedAt: null,
};

/**
 * Onboarding store actions
 */
interface OnboardingActions {
  /** Start onboarding flow */
  startOnboarding: () => void;
  /** Set focus goal */
  setGoal: (goal: FocusGoal) => void;
  /** Set focus duration preference */
  setFocusDuration: (duration: FocusDuration) => void;
  /** Set display name */
  setDisplayName: (name: string) => void;
  /** Advance to next step */
  nextStep: () => void;
  /** Go back to previous step */
  previousStep: () => void;
  /** Skip to end (mark as onboarded) */
  skipOnboarding: () => void;
  /** Mark onboarding as complete */
  completeOnboarding: () => void;
  /** Reset onboarding (for testing) */
  resetOnboarding: () => void;
  /** Check if current step can be skipped */
  canSkipCurrentStep: () => boolean;
}

/**
 * Onboarding store type
 */
export type OnboardingStore = OnboardingState & OnboardingActions;

// Use proper MMKV storage adapter for persistence
const mmkvStorage = getMMKVStorageAdapter();

/**
 * Onboarding Zustand store
 */
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startOnboarding: () => {
        set({
          ...initialState,
          startedAt: Date.now(),
        });
      },

      setGoal: (goal) => {
        set({ goal });
        // Auto-advance after 300ms delay
        setTimeout(() => {
          get().nextStep();
        }, 300);
      },

      setFocusDuration: (duration) => {
        set({ focusDuration: duration });
        // Auto-advance after 300ms delay
        setTimeout(() => {
          get().nextStep();
        }, 300);
      },

      setDisplayName: (name) => {
        const trimmed = name.trim();
        if (trimmed.length >= 2) {
          set({ displayName: trimmed });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      skipOnboarding: () => {
        set({
          isOnboarded: true,
          completedAt: Date.now(),
        });
      },

      completeOnboarding: () => {
        set({
          isOnboarded: true,
          completedAt: Date.now(),
        });
      },

      resetOnboarding: () => {
        set(initialState);
      },

      canSkipCurrentStep: () => {
        const { currentStep } = get();
        // Can skip from step 2 onward (Goal Setting and beyond)
        return currentStep >= 1;
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> => {
          return await mmkvStorage.getItem(name);
        },
        setItem: async (name: string, value: string): Promise<void> => {
          await mmkvStorage.setItem(name, value);
        },
        removeItem: async (name: string): Promise<void> => {
          await mmkvStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        currentStep: state.currentStep,
        goal: state.goal,
        focusDuration: state.focusDuration,
        displayName: state.displayName,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            OnboardingStateSchema.parse(state);
          } catch (error) { captureSilentFailure(error, { feature: 'onboarding', operation: 'safe-fallback', type: 'data' });
            // Invalid stored state, will use initial state
          }
        }
      },
    }
  )
);

/**
 * Hook to get current onboarding progress
 */
export function useOnboardingProgress() {
  const store = useOnboardingStore();
  const totalSteps = 5;
  const percentComplete = ((store.currentStep + 1) / totalSteps) * 100;

  return {
    stepNumber: store.currentStep + 1,
    totalSteps,
    percentComplete,
    canSkip: store.currentStep >= 1,
    isComplete: store.isOnboarded,
  };
}

/**
 * Hook to check if user needs onboarding
 */
export function useNeedsOnboarding(): boolean {
  const { isOnboarded } = useOnboardingStore();
  return !isOnboarded;
}
