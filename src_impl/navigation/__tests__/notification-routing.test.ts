import {
  deepLinkToNotificationAction,
  isValidNotificationAction,
  routeNotificationAction,
} from '../notification-routing';
import { buildFeatureAccess } from '../../features/liveops-config/feature-access';

function createNavigation(): { navigate: jest.Mock } {
  return { navigate: jest.fn() };
}

describe('Notification Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error when navigation is null', () => {
    const result = routeNotificationAction(null, { type: 'start_session' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Navigation not available');
  });

  it('routes start_session action to the session stack', () => {
    const navigation = createNavigation();
    const result = routeNotificationAction(navigation, {
      type: 'start_session',
      payload: { presetId: '123' },
    });

    expect(result.success).toBe(true);
    expect(result.screen).toBe('SessionSetup');
    expect(navigation.navigate).toHaveBeenCalledWith('SessionStack', {
      screen: 'SessionSetup',
      params: expect.objectContaining({ presetId: '123' }),
    });
  });

  it('blocks boss notifications when boss route is unavailable', () => {
    const navigation = createNavigation();
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    const result = routeNotificationAction(
      navigation,
      { type: 'view_boss' },
      features,
    );

    expect(result.success).toBe(false);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('routes boss notifications when FeatureAvailability allows navigation', () => {
    const navigation = createNavigation();
    const { features } = buildFeatureAccess({ totalCompletedSessions: 7 });
    const result = routeNotificationAction(
      navigation,
      { type: 'view_boss' },
      features,
    );

    expect(result.success).toBe(true);
    expect(result.screen).toBe('Boss');
    expect(navigation.navigate).toHaveBeenCalledWith('Boss', undefined);
  });

  it('blocks custom feature routes when unregistered by availability', () => {
    const navigation = createNavigation();
    const { features } = buildFeatureAccess({ totalCompletedSessions: 0 });
    const result = routeNotificationAction(
      navigation,
      { type: 'custom', payload: { screen: 'AICoach' } },
      features,
    );

    expect(result.success).toBe(false);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('allows custom core tab routes', () => {
    const navigation = createNavigation();
    const result = routeNotificationAction(navigation, {
      type: 'custom',
      payload: { screen: 'Home' },
    });

    expect(result.success).toBe(true);
    expect(navigation.navigate).toHaveBeenCalledWith('Main', { screen: 'Home' });
  });

  it('rejects arbitrary custom screens', () => {
    const result = routeNotificationAction(createNavigation(), {
      type: 'custom',
      payload: { screen: 'Guild' },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not whitelisted');
  });

  it('converts deep links to notification actions', () => {
    expect(deepLinkToNotificationAction('session', { presetId: '123' })).toEqual({
      type: 'start_session',
      payload: { presetId: '123' },
    });
    expect(deepLinkToNotificationAction('boss', {})).toEqual({ type: 'view_boss' });
    expect(deepLinkToNotificationAction('coach', {})).toEqual({ type: 'open_coach' });
  });

  it('validates notification action shape', () => {
    expect(isValidNotificationAction({ type: 'view_boss' })).toBe(true);
    expect(isValidNotificationAction({ type: 'invalid_type' })).toBe(false);
    expect(isValidNotificationAction(null)).toBe(false);
  });
});
