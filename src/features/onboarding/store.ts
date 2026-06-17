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
  markMascotGuideCompleted: () => void;
  dismissMascotGuide: () => void;
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
  mascotGuideCompletedAt: null,
  mascotGuideDismissedAt: null,
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
        getItem: (name: string): string | null =>
          mmkvStorage.getItemSync(name) ?? null,
        setItem: (name: string, value: string): void =>
          mmkvStorage.setItemSync(name, value),
        removeItem: (name: string): void =>
          mmkvStorage.removeItemSync(name),
      })),
      // partialize: persist only state, not actions
      partialize: (state: OnboardingStore): OnboardingStore => {
        const {
          startOnboarding,
          setGoal,
          setFocusDuration,
          setDisplayName,
          setPersona,
          setElement,
          setExplicitMotivationStyle,
          recomputeMotivationProfile,
          nextStep,
          previousStep,
          skipOnboarding,
          completeOnboarding,
          resetOnboarding,
          canSkipCurrentStep,
          canCompleteForUser,
          canPreviewHome,
          markProfileStepsComplete,
          markFirstSessionStarted,
          markFirstSessionCompleted,
          markHomePreviewEntered,
          setCompletionFromBackend,
          markMascotGuideCompleted,
          dismissMascotGuide,
          setChosenLane,
          getDraft,
          saveDraft,
          ...stateToPersist
        } = state;
        return stateToPersist as OnboardingStore;
      },
      onRehydrateStorage: () =>
        createRehydrationHandler((partial) =>
          useOnboardingStore.setState(partial),
        ),
    },
  ),
);
export { useAuthStore } from '../../store';
