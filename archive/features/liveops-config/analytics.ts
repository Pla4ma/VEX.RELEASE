import { useAnalytics } from '../../analytics/hooks/useAnalytics';
import type { FeatureKey, UserExperienceStage } from './feature-access';

export function useDisclosureAnalytics() {
  const analytics = useAnalytics();

  return {
    trackOnboardingStarted: (userId: string) =>
      analytics.track('onboarding_started', { user_id: userId }),
    trackOnboardingGoalSet: (userId: string, goal: string) =>
      analytics.track('onboarding_goal_set', { user_id: userId, goal }),
    trackOnboardingCompleted: (userId: string) =>
      analytics.track('onboarding_completed', { user_id: userId }),
    trackOnboardingFirstSessionCompleted: (userId: string) =>
      analytics.track('onboarding_first_session_completed', { user_id: userId }),
    trackSessionMilestone: (userId: string, count: number) => {
      const event =
        count === 1
          ? 'first_session_completed'
          : count === 2
          ? 'second_session_completed'
          : 'third_session_completed';
      analytics.track(event, { user_id: userId, completed_sessions: count });
    },
    trackFirstSessionStarted: (userId: string, source: string) =>
      analytics.track(
        source === 'onboarding' ? 'onboarding_first_session_started' : 'first_session_started',
        { user_id: userId, source },
      ),
    trackFeatureTeaserViewed: (feature: FeatureKey, stage: UserExperienceStage) =>
      analytics.track('feature_teaser_viewed', { feature, stage }),
    trackTeaserCtaPressed: (feature: FeatureKey, cta: string, stage: UserExperienceStage) =>
      analytics.track('teaser_cta_pressed', { feature, cta, stage }),
    trackFeatureUnlocked: (feature: FeatureKey, stage: UserExperienceStage) =>
      analytics.track('feature_unlocked', { feature, stage }),
    trackSocialEmptyStateViewed: (surface: string, stage: UserExperienceStage) =>
      analytics.track('social_empty_state_viewed', { surface, stage }),
    trackNextBestActionPressed: (stage: UserExperienceStage, sessions: number) =>
      analytics.track('next_best_action_pressed', { stage, completed_sessions: sessions }),
    trackLockedFeatureScreenViewed: (feature: FeatureKey, stage: UserExperienceStage) =>
      analytics.track('locked_feature_screen_viewed', { feature, stage }),
  };
}
