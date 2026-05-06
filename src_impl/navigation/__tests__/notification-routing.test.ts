import {
  deepLinkToNotificationAction,
  isValidNotificationAction,
  routeNotificationAction,
} from '../notification-routing';
import type { NotificationAction } from '../notification-routing';

describe('Notification Routing', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('routeNotificationAction', () => {
    it('returns error when navigation is null', () => {
      const result = routeNotificationAction(null, {
        type: 'start_session',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Navigation not available');
    });

    it('routes start_session action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'start_session',
        payload: { presetId: '123' },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('SessionSetup');
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });

    it('routes view_boss action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'view_boss',
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Boss');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Main', expect.anything());
    });

    it('routes open_chest action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'open_chest',
        payload: { chestId: 'chest-123' },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Rewards');
    });

    it('routes view_squad action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'view_squad',
        payload: { squadId: 'squad-123' },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('SquadWars');
    });

    it('routes join_duel action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'join_duel',
        payload: { duelId: 'duel-123' },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Duels');
    });

    it('routes view_streak action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'view_streak',
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Streak');
    });

    it('routes open_shop action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'open_shop',
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Shop');
    });

    it('routes view_profile action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'view_profile',
        payload: { userId: 'user-123' },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Profile');
    });

    it('routes open_coach action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'open_coach',
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('AICoach');
    });

    it('routes accept_invite action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'accept_invite',
        payload: { inviteCode: 'ABC12345', squadId: 'squad-123' },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Invite');
    });

    it('routes view_progress action', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'view_progress',
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('Progress');
    });

    it('routes custom action with screen', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'custom',
        payload: { screen: 'CustomScreen', params: { id: '123' } },
      });

      expect(result.success).toBe(true);
      expect(result.screen).toBe('CustomScreen');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CustomScreen', { id: '123' });
    });

    it('returns error for custom action without screen', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'custom',
        payload: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Custom action missing screen');
    });

    it('returns error for unknown action type', () => {
      const result = routeNotificationAction(mockNavigation, {
        type: 'unknown_action' as NotificationAction['type'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown notification action type');
    });

    it('handles navigation errors gracefully', () => {
      mockNavigation.navigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const result = routeNotificationAction(mockNavigation, {
        type: 'view_boss',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Navigation error');
    });
  });

  describe('deepLinkToNotificationAction', () => {
    it('converts session path', () => {
      const action = deepLinkToNotificationAction('session', { presetId: '123' });

      expect(action.type).toBe('start_session');
      expect(action.payload?.presetId).toBe('123');
    });

    it('converts boss path', () => {
      const action = deepLinkToNotificationAction('boss', {});

      expect(action.type).toBe('view_boss');
    });

    it('converts duels path', () => {
      const action = deepLinkToNotificationAction('duels', { duelId: '123' });

      expect(action.type).toBe('join_duel');
      expect(action.payload?.duelId).toBe('123');
    });

    it('converts squad path', () => {
      const action = deepLinkToNotificationAction('squad', { squadId: 'squad-123' });

      expect(action.type).toBe('view_squad');
      expect(action.payload?.squadId).toBe('squad-123');
    });

    it('converts profile path', () => {
      const action = deepLinkToNotificationAction('profile', { userId: 'user-123' });

      expect(action.type).toBe('view_profile');
      expect(action.payload?.userId).toBe('user-123');
    });

    it('converts invite path', () => {
      const action = deepLinkToNotificationAction('invite', {
        code: 'ABC12345',
        squadId: 'squad-123',
      });

      expect(action.type).toBe('accept_invite');
      expect(action.payload?.inviteCode).toBe('ABC12345');
      expect(action.payload?.squadId).toBe('squad-123');
    });

    it('converts shop path', () => {
      const action = deepLinkToNotificationAction('shop', {});

      expect(action.type).toBe('open_shop');
    });

    it('converts coach path', () => {
      const action = deepLinkToNotificationAction('coach', {});

      expect(action.type).toBe('open_coach');
    });

    it('converts study path', () => {
      const action = deepLinkToNotificationAction('study', {});

      expect(action.type).toBe('open_coach');
    });

    it('converts settings path', () => {
      const action = deepLinkToNotificationAction('settings', {});

      expect(action.type).toBe('view_progress');
    });
  });

  describe('isValidNotificationAction', () => {
    it('returns true for valid action', () => {
      expect(isValidNotificationAction({ type: 'view_boss' })).toBe(true);
      expect(isValidNotificationAction({ type: 'start_session' })).toBe(true);
      expect(isValidNotificationAction({ type: 'open_shop' })).toBe(true);
    });

    it('returns false for invalid type', () => {
      expect(isValidNotificationAction({ type: 'invalid_type' })).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidNotificationAction(null)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isValidNotificationAction('string')).toBe(false);
      expect(isValidNotificationAction(123)).toBe(false);
    });

    it('returns false for object without type', () => {
      expect(isValidNotificationAction({})).toBe(false);
    });
  });
});
