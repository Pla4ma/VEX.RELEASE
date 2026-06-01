/**
 * Integration tests — analytics.ts Sentry breadcrumbs
 */

import {
  mockActiveSubscribers,
  mockSentry,
} from './integration-setup';
import {
  trackSystemError,
  trackOrchestrationError,
  trackSessionComplete,
} from '../analytics';

describe('integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe('analytics.ts – Sentry breadcrumbs', () => {
    it('trackSystemError sends breadcrumb with Error instance', () => {
      trackSystemError('progression', 'addXp', new Error('boom'));
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'System error: progression.addXp',
          category: 'integration.error',
          level: 'error',
          data: expect.objectContaining({
            system: 'progression',
            operation: 'addXp',
            error: 'boom',
          }),
        }),
      );
    });

    it('trackSystemError stringifies non-Error values', () => {
      trackSystemError('rewards', 'create', 'string error');
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ error: 'string error' }),
        }),
      );
    });

    it('trackSystemError handles undefined error', () => {
      trackSystemError('system', 'op', undefined);
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ error: 'undefined' }),
        }),
      );
    });

    it('trackOrchestrationError sends breadcrumb', () => {
      trackOrchestrationError('user-1', 'session-1', new Error('fail'));
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Session orchestration failed',
          category: 'integration.orchestration',
          data: { userId: 'user-1', sessionId: 'session-1' },
          level: 'error',
        }),
      );
    });

    it('trackSessionComplete sends breadcrumb with all data', () => {
      const data = {
        sessionId: 's1',
        userId: 'u1',
        duration: 1800,
        completionPercentage: 100,
        xpAwarded: 50,
        coinsAwarded: 0,
        streakBonus: 5,
        difficultyBonus: 0,
        levelUp: false,
        achievementsUnlocked: 0,
        challengesProgressed: 0,
      };
      trackSessionComplete(data);
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Session orchestration complete',
          category: 'integration.session',
          data,
          level: 'info',
        }),
      );
    });
  });
});
