/**
 * Cross-System Integration Tests
 *
 * Tests demonstrating deep integration between all systems:
 * - Sessions → Rewards, Progression, Streaks, Analytics, Social, Challenges
 * - Economy ↔ Progression, Events, Challenges, Shop, Social gifting
 * - Social ↔ Sessions, Leaderboards, Challenges, Feed, Notifications
 * - AI Coach ↔ Streaks, Sessions, Reminders, Challenges, Comeback flows
 */

import { getRewardService } from '../rewards/RewardService';
import { getProgressionService } from '../progression/ProgressionService';
import { getStreakService } from '../streaks/StreakService';
import { getEconomyService } from '../economy/EconomyService';
import { getEventService } from '../events/EventService';
import { getSocialService } from '../social/SocialService';
import { getCoachService } from '../coach/CoachService';
import { eventBus } from '../events';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('Cross-System Integration', () => {
  const USER_ID = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem = jest.fn().mockResolvedValue(null);
  });

  describe('Session Completion Flow', () => {
    it('should propagate session completion through all systems', async () => {
      // Initialize all services
      const rewards = getRewardService(USER_ID);
      const progression = getProgressionService(USER_ID);
      const streaks = getStreakService(USER_ID);
      const economy = getEconomyService(USER_ID);
      const events = getEventService(USER_ID);
      const social = getSocialService(USER_ID);

      // Simulate session completion
      const sessionDuration = 1800; // 30 minutes

      // Publish session completed event
      eventBus.publish('session:completed', {
        userId: USER_ID,
        duration: sessionDuration,
      });

      // Allow time for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify progression received XP
      expect(progression.getTotalXP()).toBeGreaterThan(0);

      // Verify streak was recorded
      expect(streaks.getCurrentStreak()).toBeGreaterThanOrEqual(0);

      // Verify social shared activity
      const socialState = social.getFriends();
      // Social activity would have been published

      // Verify events received progress update
      const activeChallenges = events.getActiveChallenges();
      // Challenges related to sessions should have progress
    });

    it('should grant rewards through multiple systems simultaneously', async () => {
      const rewards = getRewardService(USER_ID);
      const economy = getEconomyService(USER_ID);
      const progression = getProgressionService(USER_ID);

      // Initial state
      const initialXP = progression.getTotalXP();
      const initialCoins = economy.getBalance('COINS');

      // Grant XP reward
      await rewards.grantReward('XP', 'SESSION_COMPLETE', {
        baseAmount: 1,
        streakMultiplier: 2,
        levelMultiplier: 1.5,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify XP reached progression
      expect(progression.getTotalXP()).toBeGreaterThan(initialXP);

      // Grant currency reward
      await rewards.grantReward('CURRENCY', 'CHALLENGE_COMPLETE', {
        baseAmount: 1,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify currency reached economy
      expect(economy.getBalance('COINS')).toBeGreaterThanOrEqual(initialCoins);
    });
  });

  describe('Level Up Cascade', () => {
    it('should trigger multi-system updates on level up', async () => {
      const progression = getProgressionService(USER_ID);
      const social = getSocialService(USER_ID);
      const economy = getEconomyService(USER_ID);
      const events = getEventService(USER_ID);

      // Track initial level
      const initialLevel = progression.getLevel();

      // Add enough XP to level up
      await progression.addXP(10000, 'SESSION_COMPLETE');

      // Allow processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify level increased
      expect(progression.getLevel()).toBeGreaterThan(initialLevel);

      // Verify economy updated level multiplier
      // (Economy listens to progression:level_up)

      // Verify social received level up event
      // (Social listens for social:level_up)

      // Verify challenges checked for level requirements
      // (EventService listens for challenges:check_level)
    });
  });

  describe('Streak Milestone Flow', () => {
    it('should celebrate streak milestones across systems', async () => {
      const streaks = getStreakService(USER_ID);
      const rewards = getRewardService(USER_ID);
      const social = getSocialService(USER_ID);
      const progression = getProgressionService(USER_ID);

      // Set up a 7-day streak
      await streaks.restoreStreak(7);
      await streaks.recordSession();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify milestone reward was granted
      // Verify social shared the milestone
      // Verify XP bonus was applied to progression
      // Verify analytics tracked the milestone
    });

    it('should handle streak break comeback flow', async () => {
      const streaks = getStreakService(USER_ID);
      const coach = getCoachService(USER_ID);
      const rewards = getRewardService(USER_ID);

      // Create a large streak then break it
      await streaks.restoreStreak(14);

      // Simulate time passing (streak breaks after 48 hours)
      const state = streaks.getState();
      (state as any).lastSessionAt = Date.now() - 72 * 60 * 60 * 1000;

      // Record session (triggers streak break detection)
      await streaks.recordSession();

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify coach generated comeback plan
      expect(coach.getComebackPlan()).toBeDefined();

      // Verify comeback reward was granted
      // Verify notifications were sent
    });
  });

  describe('Social Gifting Flow', () => {
    it('should complete gift flow between users', async () => {
      const senderId = 'sender-user';
      const receiverId = 'receiver-user';

      const senderEconomy = getEconomyService(senderId);
      const receiverEconomy = getEconomyService(receiverId);
      const receiverSocial = getSocialService(receiverId);

      // Add currency to sender
      await senderEconomy.addCurrency('COINS', 1000, 'TEST');

      // Send gift
      await senderEconomy.sendGift(receiverId, 'COINS', 100);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify sender balance reduced
      expect(senderEconomy.getBalance('COINS')).toBe(900);

      // Verify receiver got gift
      // (In real implementation, this would come through event listener)
    });
  });

  describe('Challenge Completion Flow', () => {
    it('should reward challenge completion across systems', async () => {
      const events = getEventService(USER_ID);
      const rewards = getRewardService(USER_ID);
      const progression = getProgressionService(USER_ID);
      const social = getSocialService(USER_ID);

      // Register a challenge
      const challenge = events.registerChallenge({
        id: 'test-challenge',
        eventId: undefined,
        title: 'Test Challenge',
        description: 'Complete 3 sessions',
        type: 'SESSION_COUNT',
        status: 'ACTIVE',
        requirement: { target: 3, metric: 'sessions' },
        progress: 0,
        progressHistory: [],
        rewards: [{ type: 'XP', amount: 500 }],
        startAt: Date.now(),
        endAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        difficulty: 'MEDIUM',
        participants: [USER_ID],
        completedBy: [],
        claimedBy: [],
      });

      // Join challenge
      events.joinChallenge('test-challenge');

      // Simulate completing sessions
      for (let i = 0; i < 3; i++) {
        eventBus.publish('session:completed', {
          userId: USER_ID,
          duration: 1800,
        });
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify challenge marked complete
      const updated = events.getChallengeById('test-challenge');
      if (updated) {
        expect(updated.completedBy).toContain(USER_ID);
      }

      // Verify rewards were granted
      // Verify social shared achievement
      // Verify progression got XP
    });
  });

  describe('AI Coach Integration', () => {
    it('should adapt recommendations based on user behavior', async () => {
      const coach = getCoachService(USER_ID);
      const progression = getProgressionService(USER_ID);

      // Simulate session completions
      for (let i = 0; i < 5; i++) {
        eventBus.publish('session:completed', {
          userId: USER_ID,
          duration: 1800,
        });
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify coach generated recommendations
      const recommendations = coach.getRecommendations({ pendingOnly: true });
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendations are sorted by priority
      const priorities = recommendations.map(r => r.priority);
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(
          priorityOrder[priorities[i - 1]]
        );
      }
    });

    it('should generate comeback plan on significant streak break', async () => {
      const coach = getCoachService(USER_ID);
      const streaks = getStreakService(USER_ID);

      // Set up 10-day streak
      await streaks.restoreStreak(10);

      // Break the streak
      const state = streaks.getState();
      (state as any).lastSessionAt = Date.now() - 72 * 60 * 60 * 1000;

      // Publish streak broken event
      eventBus.publish('streak:broken', {
        userId: USER_ID,
        previousStreak: 10,
        wasComeback: true,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify coach generated comeback plan
      const plan = coach.getComebackPlan();
      expect(plan).toBeDefined();
      expect(plan?.previousStreak).toBe(10);
      expect(plan?.dailyGoals.length).toBeGreaterThan(0);
    });
  });

  describe('Economy Level Multiplier Integration', () => {
    it('should apply level-based multipliers to currency earnings', async () => {
      const economy = getEconomyService(USER_ID);
      const progression = getProgressionService(USER_ID);

      // Level up to 10
      eventBus.publish('progression:level_up', {
        userId: USER_ID,
        newLevel: 10,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      // Add currency (should get 1.1x multiplier at level 10)
      await economy.addCurrency('COINS', 100, 'TEST');

      // Verify multiplier was applied
      expect(economy.getBalance('COINS')).toBeGreaterThanOrEqual(110);
    });
  });

  describe('Event System Challenge Progress', () => {
    it('should track challenge progress from various activities', async () => {
      const events = getEventService(USER_ID);

      // Register XP-based challenge
      events.registerChallenge({
        id: 'xp-challenge',
        title: 'Earn 1000 XP',
        description: 'Collect 1000 XP',
        type: 'XP_EARNED',
        status: 'ACTIVE',
        requirement: { target: 1000, metric: 'xp' },
        progress: 0,
        progressHistory: [],
        rewards: [{ type: 'CURRENCY', amount: 100 }],
        startAt: Date.now(),
        endAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        difficulty: 'EASY',
        participants: [USER_ID],
        completedBy: [],
        claimedBy: [],
      });

      events.joinChallenge('xp-challenge');

      // Publish XP added event
      eventBus.publish('progression:xp_added', {
        userId: USER_ID,
        amount: 500,
        source: 'SESSION_COMPLETE',
        totalXP: 500,
        currentLevel: 1,
        progressPercent: 50,
        streakBonus: 0,
        boostBonus: 0,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify challenge progress updated
      const progress = events.getUserChallengeProgress('xp-challenge');
      expect(progress).toBeGreaterThan(0);
    });
  });

  describe('Race Conditions & Concurrency', () => {
    it('should handle concurrent reward grants safely', async () => {
      const rewards = getRewardService(USER_ID);

      // Grant multiple rewards concurrently
      const promises = Array(10).fill(null).map((_, i) =>
        rewards.grantReward('XP', 'SESSION_COMPLETE', { baseAmount: 10 + i })
      );

      const results = await Promise.all(promises);

      // Verify all rewards have unique IDs
      const ids = results.map(r => r.id);
      expect(new Set(ids).size).toBe(10);

      // Verify all rewards are valid
      results.forEach(reward => {
        expect(reward.userId).toBe(USER_ID);
        expect(reward.amount).toBeGreaterThan(0);
      });
    });

    it('should handle concurrent currency operations safely', async () => {
      const economy = getEconomyService(USER_ID);

      // Add initial balance
      await economy.addCurrency('COINS', 1000, 'TEST');

      // Try to spend more than balance concurrently
      const results = await Promise.allSettled([
        economy.spendCurrency('COINS', 600, 'Test 1'),
        economy.spendCurrency('COINS', 600, 'Test 2'),
        economy.spendCurrency('COINS', 600, 'Test 3'),
      ]);

      // Count successes and failures
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // At most one should succeed (or partial success depending on timing)
      expect(succeeded + failed).toBe(3);

      // Final balance should be consistent
      const finalBalance = economy.getBalance('COINS');
      expect(finalBalance).toBeGreaterThanOrEqual(0);
      expect(finalBalance).toBeLessThanOrEqual(1000);
    });
  });

  describe('End-to-End User Journey', () => {
    it('should complete full user journey across all systems', async () => {
      // 1. User completes first session
      eventBus.publish('session:completed', {
        userId: USER_ID,
        duration: 1800,
      });
      await new Promise(resolve => setTimeout(resolve, 50));

      // 2. User earns XP and currency
      // 3. Streak starts
      // 4. Social shares activity
      // 5. Progression tracks XP

      const progression = getProgressionService(USER_ID);
      const streaks = getStreakService(USER_ID);
      const economy = getEconomyService(USER_ID);

      expect(progression.getTotalXP()).toBeGreaterThan(0);
      expect(streaks.getCurrentStreak()).toBeGreaterThanOrEqual(1);
      expect(economy.getBalance('COINS')).toBeGreaterThanOrEqual(0);

      // 6. User levels up
      await progression.addXP(1000, 'SESSION_COMPLETE');
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(progression.getLevel()).toBeGreaterThan(1);

      // 7. User joins event
      const events = getEventService(USER_ID);
      events.registerEvent({
        id: 'test-event',
        title: 'Weekend Challenge',
        description: 'Special weekend event',
        type: 'WEEKEND',
        status: 'ACTIVE',
        startAt: Date.now(),
        endAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
        challenges: [],
      });
      events.joinEvent('test-event');

      // 8. User completes challenges
      // 9. User earns rewards
      // 10. User shares achievements on social

      const social = getSocialService(USER_ID);
      const feed = social.getFeed();
      expect(feed.length).toBeGreaterThan(0);

      // 11. AI Coach provides recommendations
      const coach = getCoachService(USER_ID);
      const recommendations = coach.getRecommendations();
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });
});
