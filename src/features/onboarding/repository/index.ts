/**
 * Onboarding Repository - Barrel Export
 *
 * Exports the MMKV-based onboarding repository for local persistence.
 * The Supabase-based repository at ../repository.ts is used separately
 * for server-side sync via the onboarding service layer.
 */

export {
  OnboardingRepository,
  OnboardingRepositoryError,
  onboardingRepository,
} from './OnboardingRepository';
