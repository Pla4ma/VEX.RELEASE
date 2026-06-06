import type { OnboardingStore } from './store';
import type { OnboardingState } from './schemas';
import { LaneSchema } from '../lane-engine/schemas';
import {
  mergeOnboardingCompletion,
  isCompletionValidForUser,
  type OnboardingDraft,
} from './store-helpers';
import {
  initialState,
  getCurrentUserIdForBool,
  advanceStepWithCompletionCheck,
} from './store-action-types';
import { deriveMotivationProfile } from './store-helpers';

type SetFn = (partial: Partial<OnboardingStore>) => void;
type GetFn = () => OnboardingStore;

export function createNavigationActions(set: SetFn, get: GetFn) {
  return {
    nextStep: () => {
      const { currentStep } = get();
      if (currentStep < 5) {
        advanceStepWithCompletionCheck(set, get, currentStep + 1);
      }
    },

    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 0) {set({ currentStep: currentStep - 1 });}
    },

    skipOnboarding: () =>
      set({
        ...mergeOnboardingCompletion(true, Date.now()),
        profileStepsCompleted: true,
      }),

    completeOnboarding: (userId?: string | null) =>
      set({
        ...mergeOnboardingCompletion(true, Date.now(), userId),
        profileStepsCompleted: true,
      }),

    resetOnboarding: () => set(initialState),

    canSkipCurrentStep: () => get().currentStep >= 1,

    canCompleteForUser: (userId: string | null | undefined) =>
      isCompletionValidForUser(get(), userId),

    /** Home Preview: allowed when profile steps are done, even without first session. */
    canPreviewHome: (userId: string | null | undefined) => {
      if (!userId) {return false;}
      const state = get();
      return state.profileStepsCompleted && !state.isOnboarded;
    },

    markProfileStepsComplete: () => set({ profileStepsCompleted: true }),

    markFirstSessionStarted: () => set({ firstSessionStarted: true }),

    markFirstSessionCompleted: () =>
      set({
        firstSessionCompleted: true,
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: getCurrentUserIdForBool(),
      }),

    markHomePreviewEntered: () => set({ homePreviewEntered: true }),

    setCompletionFromBackend: (userId: string, completedAt: number) => {
      set({ completedAt, completedForUserId: userId, isOnboarded: true });
    },

    getDraft: (_userId: string) => {
      const state = get();
      return {
        goal: state.goal ?? undefined,
        focusDuration: state.focusDuration ?? undefined,
        displayName: state.displayName ?? undefined,
        starterPresetId: undefined,
        element: state.element ?? undefined,
        explicitMotivationStyle: state.explicitMotivationStyle ?? undefined,
        personaId: state.persona ?? undefined,
        squadId: null,
        chosenLane: state.chosenLane ?? undefined,
      };
    },

    saveDraft: (_userId: string, draft: OnboardingDraft) => {
      const updates: Partial<OnboardingState> = {};
      const store = get();
      if (draft.goal) {
        updates.goal = draft.goal;
        updates.motivationProfile = deriveMotivationProfile(
          draft.goal,
          draft.personaId ?? store.persona,
          draft.element ?? store.element,
          store.explicitMotivationStyle,
        );
      }
      if (draft.focusDuration) {updates.focusDuration = draft.focusDuration;}
      if (draft.displayName) {updates.displayName = draft.displayName;}
      if (draft.explicitMotivationStyle) {
        updates.explicitMotivationStyle = draft.explicitMotivationStyle;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal,
          updates.persona ?? store.persona,
          updates.element ?? store.element,
          draft.explicitMotivationStyle,
        );
      }
      if (draft.personaId) {
        updates.persona = draft.personaId;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal,
          draft.personaId,
          draft.element ?? store.element,
          updates.explicitMotivationStyle ?? store.explicitMotivationStyle,
        );
      }
      if (draft.element) {
        updates.element = draft.element;
        updates.motivationProfile = deriveMotivationProfile(
          updates.goal ?? store.goal,
          updates.persona ?? store.persona,
          draft.element,
          updates.explicitMotivationStyle ?? store.explicitMotivationStyle,
        );
      }
      if (draft.chosenLane !== undefined) {
        const parsed = LaneSchema.safeParse(draft.chosenLane);
        if (parsed.success) {updates.chosenLane = parsed.data;}
      }
      if (Object.keys(updates).length > 0) {set(updates);}
    },

    setChosenLane: (lane: import('../lane-engine/types').Lane | null) => {
      set({ chosenLane: lane });
    },
  };
}
