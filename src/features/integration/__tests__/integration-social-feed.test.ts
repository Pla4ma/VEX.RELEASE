/**
 * Integration tests — social-feed.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  fireEvent,
} from './integration-setup';
import { initializeSocialFeedIntegration } from '../social-feed';

describe('integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe('social-feed.ts', () => {
    it('subscribes to all social events', () => {
      const unsub = initializeSocialFeedIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'social:activity',
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'leaderboards:result',
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'squads:challenge_update',
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'sessions:completed',
        expect.any(Function),
      );
      unsub();
    });

    it('ignores social:activity with null event', () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent('social:activity', null);
      unsub();
    });

    it('publishes social:activity for podium finishes (rank <= 3)', () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent('leaderboards:result', {
        userId: 'u1',
        leaderboardId: 'lb-1',
        rank: 2,
        score: 500,
        participants: 20,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            'social:activity',
            expect.objectContaining({
              userId: 'u1',
              activityType: 'PODIUM_FINISH',
              visibility: 'PUBLIC',
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('publishes squads:leaderboard_update for squad leaderboards', () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent('leaderboards:result', {
        userId: 'u1',
        leaderboardId: 'squad:alpha',
        rank: 5,
        score: 300,
        participants: 10,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            'squads:leaderboard_update',
            expect.objectContaining({
              squadId: 'alpha',
              userId: 'u1',
              score: 300,
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('does NOT publish podium finish for rank > 3', () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent('leaderboards:result', {
        userId: 'u1',
        leaderboardId: 'lb-1',
        rank: 10,
        score: 200,
        participants: 50,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const podiumCalls =
            mockEventBus.eventBus.publish.mock.calls.filter(
              (c: unknown[]) =>
                c[0] === 'social:activity' &&
                (c[1] as { activityType?: string })?.activityType ===
                  'PODIUM_FINISH',
            );
          expect(podiumCalls).toHaveLength(0);
          unsub();
          resolve();
        }, 10);
      });
    });

    it('ignores squads:challenge_update with null event', () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent('squads:challenge_update', null);
      unsub();
    });
  });
});
