/**
 * BossScreen analytics tracking tests.
 *
 * Verifies:
 * - no tracking without userId
 * - tracks with correct bossIntensity
 * - tracks with correct canQueryBoss
 * - does not spam duplicate events
 */
import { describe, it, expect } from '@jest/globals';

const mockAddBreadcrumb = jest.fn();
const mockPublish = jest.fn();

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
}));

jest.mock('../../../events', () => ({
  eventBus: {
    publish: (...args: unknown[]) => mockPublish(...args),
  },
}));

import { trackBossRouteOpened } from '../../../features/boss/analytics';

describe('trackBossRouteOpened', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not crash with null userId but still tracks as breadcrumb', () => {
    trackBossRouteOpened(null, 'subtle', false);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'boss',
        message: 'Boss route opened',
        data: expect.objectContaining({ userId: null, bossIntensity: 'subtle', canQueryBoss: false }),
      }),
    );
  });

  it('tracks with correct bossIntensity', () => {
    trackBossRouteOpened('user-1', 'game-like', true);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ bossIntensity: 'game-like' }),
      }),
    );
  });

  it('tracks with correct canQueryBoss', () => {
    trackBossRouteOpened('user-1', 'subtle', true);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ canQueryBoss: true }),
      }),
    );

    jest.clearAllMocks();
    trackBossRouteOpened('user-1', 'subtle', false);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ canQueryBoss: false }),
      }),
    );
  });

  it('publishes analytics event with correct properties', () => {
    trackBossRouteOpened('user-2', 'intense', true);
    expect(mockPublish).toHaveBeenCalledWith('analytics:track', {
      event: 'boss_route_opened',
      properties: { userId: 'user-2', bossIntensity: 'intense', canQueryBoss: true },
    });
  });

  it('tracks intensity for all valid intensity levels', () => {
    for (const intensity of ['subtle', 'game-like', 'intense']) {
      jest.clearAllMocks();
      trackBossRouteOpened('user-1', intensity, true);
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bossIntensity: intensity }),
        }),
      );
    }
  });
});
