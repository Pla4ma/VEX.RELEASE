import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../constants/storage';
import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { captureSilentFailure } from '../utils/silent-failure';
import {
  parsePersistedOnboardingState,
  type PersistedOnboardingState,
} from './persistence';
import type { OnboardingDraft, OnboardingProfile } from './types';

interface OnboardingState {
  drafts: Record<string, OnboardingDraft>;
  profiles: Record<string, OnboardingProfile>;
  isHydrated: boolean;
  getDraft: (userId: string) => OnboardingDraft | undefined;
  getProfile: (userId: string) => OnboardingProfile | undefined;
  hasCompletedOnboarding: (userId: string) => boolean;
  saveDraft: (userId: string, updates: Partial<OnboardingDraft>) => void;
  completeOnboarding: (userId: string, profile: Omit<OnboardingProfile, 'completedAt'>) => void;
  resetOnboarding: (userId: string) => void;
  setHydrated: (value: boolean) => void;
}

const syncCompletionFlag = async (profiles: Record<string, OnboardingProfile>): Promise<void> => {
  await getMMKVStorageAdapter().setItem(
    STORAGE_KEYS.ONBOARDING_COMPLETE,
    JSON.stringify(
      Object.fromEntries(Object.keys(profiles).map((userId) => [userId, true]))
    )
  );
};

const reportCompletionFlagSyncFailure = (error: unknown): void => {
  captureSilentFailure(error, {
    feature: 'onboarding',
    operation: 'sync-completion-flag',
    type: 'data',
  });
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      drafts: {},
      profiles: {},
      isHydrated: false,
      getDraft: (userId) => get().drafts[userId],
      getProfile: (userId) => get().profiles[userId],
      hasCompletedOnboarding: (userId) => Boolean(get().profiles[userId]?.completedAt),
      saveDraft: (userId, updates) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [userId]: {
              ...state.drafts[userId],
              ...updates,
              updatedAt: Date.now(),
            },
          },
        })),
      completeOnboarding: (userId, profile) => {
        const completedProfile: OnboardingProfile = {
          ...profile,
          completedAt: Date.now(),
        };

        set((state) => {
          const nextProfiles = {
            ...state.profiles,
            [userId]: completedProfile,
          };

          syncCompletionFlag(nextProfiles).catch(reportCompletionFlagSyncFailure);

          return {
            drafts: {
              ...state.drafts,
              [userId]: {
                goal: profile.goal,
                personaId: profile.personaId,
                starterPresetId: profile.starterPresetId,
                squadId: profile.squadId,
                updatedAt: Date.now(),
              },
            },
            profiles: nextProfiles,
          };
        });
      },
      resetOnboarding: (userId) =>
        set((state) => {
          const nextDrafts = { ...state.drafts };
          const nextProfiles = { ...state.profiles };
          delete nextDrafts[userId];
          delete nextProfiles[userId];
          syncCompletionFlag(nextProfiles).catch(reportCompletionFlagSyncFailure);

          return {
            drafts: nextDrafts,
            profiles: nextProfiles,
          };
        }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.ONBOARDING_PROFILE,
      storage: createJSONStorage(() => getMMKVStorageAdapter()),
      partialize: (state): PersistedOnboardingState => ({
        drafts: state.drafts,
        profiles: state.profiles,
      }),
      merge: (persistedState, currentState): OnboardingState => ({
        ...currentState,
        ...parsePersistedOnboardingState(persistedState),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          captureSilentFailure(error, {
            feature: 'onboarding',
            operation: 'rehydrate',
            type: 'data',
          });
        }
        state?.setHydrated(true);
      },
    }
  )
);
