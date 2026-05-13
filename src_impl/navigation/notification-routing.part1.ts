import type { NavigationProp } from "@react-navigation/native";
import { createDebugger } from "../utils/debug";
import type { DeepLinkPath } from "./deep-links";
import type { RootStackParams, MainStackParams, MainTabParams } from "./types";
import { navigateToSessionStackScreen, navigateToMainTab, navigateToMainStackScreen, safeNavigate } from "./navigation-helpers";


export function routeNotificationAction(
  navigation: NavigationProp<RootStackParams> | null | undefined,
  action: NotificationAction
): NotificationRouteResult {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }

  try {
    switch (action.type) {
      case 'start_session':
        return navigateToSessionSetup(navigation, action.payload);

      case 'view_boss':
        return navigateToBoss(navigation);

      case 'open_chest':
        return navigateToChest(navigation, action.payload);

      case 'view_squad':
        return navigateToSquad(navigation, action.payload);

      case 'view_streak':
        return navigateToStreak(navigation);

      case 'open_shop':
        return navigateToShop(navigation);

      case 'view_profile':
        return navigateToProfile(navigation, action.payload);

      case 'open_coach':
        return navigateToCoach(navigation);

      case 'accept_invite':
        return navigateToInvite(navigation, action.payload);

      case 'view_progress':
        return navigateToProgress(navigation);

      case 'custom':
        return handleCustomAction(navigation, action.payload);

      default:
        return {
          success: false,
          error: `Unknown notification action type: ${action.type}`,
        };
    }
  } catch (error) {
    debug.error(
      'Failed to route notification action',
      error instanceof Error ? error : undefined
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function deepLinkToNotificationAction(
  path: DeepLinkPath,
  params: Record<string, string>
): NotificationAction {
  switch (path) {
    case 'session':
      return {
        type: 'start_session',
        payload: { presetId: params.presetId },
      };

    case 'boss':
      return { type: 'view_boss' };

    case 'squad':
      return {
        type: 'join_duel',
        payload: { duelId: params.duelId },
      };

    case 'squad':
      return {
        type: 'view_squad',
        payload: { squadId: params.squadId },
      };

    case 'profile':
      return {
        type: 'view_profile',
        payload: { userId: params.userId },
      };

    case 'invite':
      return {
        type: 'accept_invite',
        payload: { inviteCode: params.code, squadId: params.squadId },
      };

    case 'settings':
      return { type: 'view_progress' };

    case 'study':
      return { type: 'open_coach' };

    case 'shop':
      return { type: 'open_shop' };

    case 'coach':
      return { type: 'open_coach' };

    default:
      return { type: 'custom', payload: { screen: path, params } };
  }
}

export function isValidNotificationAction(
  action: unknown
): action is NotificationAction {
  if (!action || typeof action !== 'object') {
    return false;
  }

  const validTypes: NotificationActionType[] = [
    'start_session',
    'view_boss',
    'open_chest',
    'view_squad',
    'join_duel',
    'view_streak',
    'open_shop',
    'view_profile',
    'open_coach',
    'accept_invite',
    'view_progress',
    'custom',
  ];

  const actionType = (action as NotificationAction).type;
  return validTypes.includes(actionType);
}