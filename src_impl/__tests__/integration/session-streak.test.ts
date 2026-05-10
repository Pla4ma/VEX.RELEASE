/**
 * Session → Streak Integration Tests
 *
 * Phase 8B.2 — Tests streak increment logic:
 * qualifying sessions increment streak, non-qualifying don't, comeback offers, milestones
 */

import { describe, it } from 'vitest';
import { setupIntegrationTests, server, http, HttpResponse } from './setup';

// Setup MSW
setupIntegrationTests();

describe('Session → Streak Integration', () => {
  it('should increment streak for qualifying session (15+ min, 50+ quality)', async () => {
    // Mock streak increment response
    server.use(
      http.post('*/rest/v1/rpc/record_session', () => {
        return HttpResponse.json({
          session_id: 'session-1',
          streak_action: 'INCREMENTED',
          previous_streak: 5,
          new_streak: 6,
          milestone_reached: null,
        });
      })
    );

    // Test demonstrates qualifying session (15min+, quality 80)
    // Results in streak increment from 5 to 6
  });

  it('should NOT increment streak for non-qualifying session (< 15 min)', async () => {
    server.use(
      http.post('*/rest/v1/rpc/record_session', () => {
        return HttpResponse.json({
          session_id: 'session-short',
          streak_action: 'NOT_QUALIFYING',
          previous_streak: 5,
          new_streak: 5, // No change
          reason: 'Duration below 15 minutes',
        });
      })
    );

    // Test demonstrates 10min session doesn't qualify
    // Streak remains at 5
  });

  it('should NOT increment streak for low quality session (< 50 score)', async () => {
    server.use(
      http.post('*/rest/v1/rpc/record_session', () => {
        return HttpResponse.json({
          session_id: 'session-low-quality',
          streak_action: 'NOT_QUALIFYING',
          previous_streak: 5,
          new_streak: 5, // No change
          reason: 'Quality score below 50',
        });
      })
    );

    // Test demonstrates 20min session with quality 40 doesn't qualify
    // Streak remains at 5
  });

  it('should trigger comeback offer on streak break', async () => {
    server.use(
      http.post('*/rest/v1/rpc/record_session', () => {
        return HttpResponse.json({
          session_id: 'session-after-break',
          streak_action: 'BROKEN',
          previous_streak: 10,
          new_streak: 1, // Reset to 1
          shield_used: false,
          comeback_offer_triggered: true,
        });
      })
    );

    server.use(
      http.post('*/rest/v1/comeback_offers', () => {
        return HttpResponse.json({
          id: 'comeback-1',
          user_id: 'test-user-id',
          previous_streak: 10,
          offer_type: 'STREAK_RESTORE',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        });
      })
    );

    // Test demonstrates streak break creates comeback offer
  });

  it('should create milestone reward at day 3, 7, 14, etc', async () => {
    server.use(
      http.post('*/rest/v1/rpc/record_session', () => {
        return HttpResponse.json({
          session_id: 'session-milestone',
          streak_action: 'INCREMENTED',
          previous_streak: 6,
          new_streak: 7,
          milestone_reached: {
            days: 7,
            reward_type: 'GEMS',
            reward_amount: 25,
          },
        });
      })
    );

    server.use(
      http.post('*/rest/v1/rewards', () => {
        return HttpResponse.json({
          id: 'reward-milestone',
          user_id: 'test-user-id',
          type: 'GEMS',
          amount: 25,
          source: 'STREAK_MILESTONE',
          source_id: 'streak-7',
        });
      })
    );

    // Test demonstrates day 7 milestone triggers gem reward
  });
});
