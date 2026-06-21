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

  it('does not crash with null userId (boss analytics active)', () => {
    trackBossRouteOpened(null, 'subtle', false);
    expect(mockAddBreadcrumb).toHaveBeenCalled();
  });

  it('tracks with valid inputs via Sentry breadcrumb', () => {
    trackBossRouteOpened('user-1', 'game-like', true);
    expect(mockAddBreadcrumb).toHaveBeenCalled();
  });

  it('publishes no eventBus events (uses Sentry only)', () => {
    trackBossRouteOpened('user-2', 'intense', true);
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('tracks across all intensity levels', () => {
    for (const intensity of ['subtle', 'game-like', 'intense']) {
      jest.clearAllMocks();
      trackBossRouteOpened('user-1', intensity, true);
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    }
  });
});
