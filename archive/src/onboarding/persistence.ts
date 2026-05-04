import { captureSilentFailure } from '../utils/silent-failure';
import { OnboardingPersistedStateSchema } from './schemas';
import type { OnboardingDraft, OnboardingProfile } from './types';

export type PersistedOnboardingState = {
  drafts: Record<string, OnboardingDraft>;
  profiles: Record<string, OnboardingProfile>;
};

export function parsePersistedOnboardingState(input: unknown): PersistedOnboardingState {
  const result = OnboardingPersistedStateSchema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  if (input !== null && input !== undefined) {
    captureSilentFailure(result.error, {
      feature: 'onboarding',
      operation: 'rehydrate',
      type: 'data',
    });
  }

  return {
    drafts: {},
    profiles: {},
  };
}
