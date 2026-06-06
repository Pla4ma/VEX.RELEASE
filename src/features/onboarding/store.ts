import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

import type { OnboardingState } from './schemas';
import { createStoreActions } from './store-actions';
import { createRehydrationHandler } from './store-helpers';

export interface OnboardingActions {
  startOnboarding: () => void;
  setGoal: (goal: import('./schemas').FocusGoal) => void;
  setFocusDuration: (duration: import('./schemas').FocusDuration) => void;
  setDisplayName: (name: string) => void;
  setPersona: (persona: import('./schemas').CoachPersona) => void;
  setElement: (element: import('./schemas').OnboardingElement) => void;
  setExplicitMotivationStyle: (
    style: import('./schemas').MotivationProfileType,
  ) => void;
  recomputeMotivationProfile: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: (userId?: string | null) => void;
  resetOnboarding: () => void;
  canSkipCurrentStep: () => boolean;
  canCompleteForUser: (userId: string | null | undefined) => boolean;
  canPreviewHome: (userId: string | null | undefined) => boolean;
  markProfileStepsComplete: () => void;
  markFirstSessionStarted: () => void;
  markFirstSessionCompleted: () => void;
  markHomePreviewEntered: () => void;
  setCompletionFromBackend: (userId: string, completedAt: number) => void;
  setChosenLane: (lane: import('../lane-engine/types').Lane | null) => void;
  getDraft: (
    userId: string,
  ) => import('./store-helpers').OnboardingDraft | undefined;
  saveDraft: (
    userId: string,
    draft: import('./store-helpers').OnboardingDraft,
  ) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
  isOnboarded: false,
  currentStep: 0,
  goal: null,
  focusDuration: null,
  displayName: null,
  startedAt: null,
  completedAt: null,
  completedForUserId: null,
  persona: null,
  element: null,
  motivationProfile: null,
  explicitMotivationStyle: null,
  profileStepsCompleted: false,
  firstSessionStarted: false,
  firstSessionCompleted: false,
  homePreviewEntered: false,
  chosenLane: null,
};

const mmkvStorage = getMMKVStorageAdapter();

export const useOnboardingStore = create(
  persist<OnboardingStore>(
    (set, get) => ({
      ...initialState,
      ...createStoreActions(set, get),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> =>
          mmkvStorage.getItem(name),
        setItem: async (name: string, value: string): Promise<void> =>
          mmkvStorage.setItem(name, value),
        removeItem: async (name: string): Promise<void> =>
          mmkvStorage.removeItem(name),
      })),
      partialize: (state) =>
        ({
          isOnboarded: state.isOnboarded,
          currentStep: state.currentStep,
          goal: state.goal,
          focusDuration: state.focusDuration,
          displayName: state.displayName,
          startedAt: state.startedAt,
          completedAt: state.completedAt,
          completedForUserId: state.completedForUserId,
          persona: state.persona,
          element: state.element,
          motivationProfile: state.motivationProfile,
          explicitMotivationStyle: state.explicitMotivationStyle,
          chosenLane: state.chosenLane,
        }) as OnboardingStore,
      onRehydrateStorage: () =>
        createRehydrationHandler((partial) =>
          useOnboardingStore.setState(partial),
        ),
    },
  ),
);
