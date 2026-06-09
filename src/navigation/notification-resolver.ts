import {
  type NotificationAction,
  type _NotificationSafeIntent,
  type SafeNotificationResolution,
  ALLOWED_MAIN_TAB_SCREENS,
  ALLOWED_ROOT_SCREENS,
  toOptionalString,
} from './notification-routing-types';
import { isFeatureHidden } from '../features/liveops-config/FeatureFlagService';
import { canUseFeature, type FeatureAccessCheck } from './notification-filters';

/**
 * Resolves a notification action to a safe intent.
 * Safe intents are never raw route strings — they represent user-facing actions.
 * The actual route mapping happens after FeatureAvailability checks.
 */
export function resolveNotificationAction(
  action: NotificationAction,
  featureAccess?: FeatureAccessCheck,
  motivationStyle?: string | null,
): SafeNotificationResolution {
  switch (action.type) {
    case 'start_session':
    case 'view_streak':
      return { intent: 'START_SESSION', params: action.payload };
    case 'start_rescue':
      return { intent: 'START_RESCUE', params: action.payload };
    case 'view_boss': {
      if (isFeatureHidden('boss_tab')) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Boss feature is not available in final release',
        };
      }
      const bossAvailable = canUseFeature(featureAccess, 'boss_tab');
      if (!bossAvailable) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Boss feature is not available yet',
        };
      }
      const isGameUser =
        motivationStyle === 'game_like' || motivationStyle === 'intense';
      return { intent: 'OPEN_BOSS', params: { subtle: !isGameUser } };
    }
    case 'view_squad':
    case 'join_duel': {
      if (isFeatureHidden('squads')) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Squads are not available in final release',
        };
      }
      const squadsAvailable = canUseFeature(featureAccess, 'squads');
      if (!squadsAvailable) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Squads are not available yet',
        };
      }
      return {
        intent: 'OPEN_HOME',
        fallbackReason:
          'Squad actions redirect to Home while social is limited',
      };
    }
    case 'open_shop': {
      if (isFeatureHidden('shop')) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Shop is not available in final release',
        };
      }
      const shopAvailable = canUseFeature(featureAccess, 'shop');
      if (!shopAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Shop is not available' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Shop redirects to Home' };
    }
    case 'open_chest':
      if (isFeatureHidden('inventory')) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Chests are not available in final release',
        };
      }
      return {
        intent: 'OPEN_HOME',
        fallbackReason: 'Chest opening redirects to Home',
      };
    case 'open_coach': {
      if (isFeatureHidden('ai_coach_advanced')) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'Coach is not available in final release',
        };
      }
      const coachAvailable = canUseFeature(featureAccess, 'ai_coach_advanced');
      if (!coachAvailable) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: 'AICoach is not available yet',
        };
      }
      return { intent: 'OPEN_COACH', params: action.payload };
    }
    case 'view_progress':
    case 'accept_invite':
      return { intent: 'OPEN_PROGRESS', params: action.payload };
    case 'view_profile':
      return { intent: 'OPEN_PROFILE', params: action.payload };
    case 'custom': {
      const screen = toOptionalString(action.payload?.screen);
      if (!screen) {return { intent: 'OPEN_HOME' };}
      if (
        !ALLOWED_MAIN_TAB_SCREENS.has(screen) &&
        !ALLOWED_ROOT_SCREENS.has(screen)
      ) {
        return {
          intent: 'OPEN_HOME',
          fallbackReason: `Screen ${screen} is not whitelisted`,
        };
      }
      return {
        intent: 'OPEN_HOME',
        fallbackReason: 'custom type always routes Home in final release',
      };
    }
    default:
      return { intent: 'OPEN_HOME' };
  }
}
