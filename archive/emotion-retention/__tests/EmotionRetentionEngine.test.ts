/**
 * Emotion Retention Engine Tests
 *
 * Tests for emotional momentum tracking and retention interventions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  EmotionRetentionEngine,
  initializeEmotionRetention,
  getEmotionRetentionEngine,
} from '../EmotionRetentionEngine';
import { eventBus } from '@/events';
import type { SessionStory } from '@/features/session-story/schemas';

// Create fresh engine instance for each test
let engine: EmotionRetentionEngine;

describe('EmotionRetentionEngine', () => {
  beforeEach(() => {
    engine = new EmotionRetentionEngine();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('State Management', () => {
    it('should create initial state for new user', () => {
      const state = engine.getUserState('user-123');

      expect(state.userId).toBe('user-123');
      expect(state.momentumScore).toBe(50);
      expect(state.emotionalTrajectory).toBe('STABLE');
      expect(state.riskFactors).toEqual([]);
      expect(state.protectiveFactors).toEqual([]);
    });

    it('should return same state for existing user', () => {
      const state1 = engine.getUserState('user-123');
      const state2 = engine.getUserState('user-123');

      expect(state1).toBe(state2);
    });

    it('should maintain separate state for different users', () => {
      const state1 = engine.getUserState('user-1');
      const state2 = engine.getUserState('user-2');

      expect(state1.userId).toBe('user-1');
      expect(state2.userId).toBe('user-2');
      expect(state1).not.toBe(state2);
    });
  });

  describe('Story Engagement Processing', () => {
    const mockStory: SessionStory = {
      id: 'story-123',
      sessionId: 'session-123',
      userId: 'user-123',
      createdAt: Date.now(),
      title: 'Test Story',
      subtitle: 'A test session',
      overallEmotion: 'TRIUMPH',
      beats: [
        {
          id: 'beat-1',
          type: 'OPENING',
          sequenceOrder: 0,
          headline: 'You began',
          emotion: 'DETERMINATION',
          visualCue: 'NONE',
          durationMs: 1500,
        },
        {
          id: 'beat-2',
          type: 'FOCUS_JOURNEY',
          sequenceOrder: 1,
          headline: 'You stayed focused',
          emotion: 'TRIUMPH',
          visualCue: 'PROGRESS_BAR',
          durationMs: 2500,
        },
      ],
      totalBeats: 2,
      sessionContext: {
        durationMinutes: 25,
        focusScore: 85,
        streakDays: 5,
        interruptions: 0,
        pauses: 0,
        sessionMode: 'STANDARD',
        bossDamageDealt: 0,
        bossDefeated: false,
        xpEarned: 250,
        isPerfectSession: false,
        isComeback: false,
        daysAbsent: 0,
      },
      nextSessionHooks: [],
    };

    it('should increase momentum on story engagement', () => {
      const initialState = engine.getUserState('user-123');
      const initialMomentum = initialState.momentumScore;

      engine.recordEngagement('user-123', 'story_viewed', 90);

      const newState = engine.getUserState('user-123');
      expect(newState.momentumScore).toBeGreaterThan(initialMomentum);
    });

    it('should detect rising trajectory with high momentum', () => {
      // Simulate multiple positive engagements
      for (let i = 0; i < 5; i++) {
        engine.recordEngagement('user-123', 'session_completed', 20);
      }

      const state = engine.getUserState('user-123');
      expect(state.momentumScore).toBe(100);
      expect(state.emotionalTrajectory).toBe('RISING');
    });

    it('should detect at-risk trajectory with low momentum', () => {
      // Simulate negative events
      engine.recordEngagement('user-123', 'session_abandoned', 30);
      engine.recordEngagement('user-123', 'session_abandoned', 30);

      const state = engine.getUserState('user-123');
      expect(state.momentumScore).toBeLessThan(30);
      expect(state.emotionalTrajectory).toBe('AT_RISK');
    });

    it('should track last positive moment timestamp', () => {
      const before = Date.now();
      engine.recordEngagement('user-123', 'session_completed', 20);
      const after = Date.now();

      const state = engine.getUserState('user-123');
      expect(state.lastPositiveMoment).toBeGreaterThanOrEqual(before);
      expect(state.lastPositiveMoment).toBeLessThanOrEqual(after);
    });

    it('should track last negative moment timestamp', () => {
      const before = Date.now();
      engine.recordEngagement('user-123', 'session_abandoned', 20);
      const after = Date.now();

      const state = engine.getUserState('user-123');
      expect(state.lastNegativeMoment).toBeGreaterThanOrEqual(before);
      expect(state.lastNegativeMoment).toBeLessThanOrEqual(after);
    });
  });

  describe('Streak Updates', () => {
    it('should add protective factor for active streak', () => {
      engine.processStreakUpdate?.('user-123', 7);

      const state = engine.getUserState('user-123');
      const protectiveFactor = state.protectiveFactors.find(p => p.type === 'STREAK_ACTIVE');

      expect(protectiveFactor).toBeDefined();
      expect(protectiveFactor?.strength).toBe(14); // 7 * 2
    });

    it('should add milestone close protective factor', () => {
      // 6 days, 1 from day 7 milestone
      engine.processStreakUpdate?.('user-123', 6);

      const state = engine.getUserState('user-123');
      const milestoneFactor = state.protectiveFactors.find(p => p.type === 'MILESTONE_CLOSE');

      expect(milestoneFactor).toBeDefined();
      expect(milestoneFactor?.strength).toBe(70);
    });

    it('should update milestone factor when closer to milestone', () => {
      // 6 days out (close to 7)
      engine.processStreakUpdate?.('user-123', 6);
      // 13 days out (close to 14)
      engine.processStreakUpdate?.('user-123', 13);

      const state = engine.getUserState('user-123');
      const milestoneFactors = state.protectiveFactors.filter(p => p.type === 'MILESTONE_CLOSE');

      expect(milestoneFactors.length).toBe(1);
    });
  });

  describe('Risk Detection', () => {
    it('should detect critical session gap', () => {
      // Set last positive moment to 50 hours ago
      const oldTimestamp = Date.now() - 50 * 60 * 60 * 1000;
      engine.recordEngagement('user-123', 'session_completed', 20);

      // Manually set old timestamp
      const state = engine.getUserState('user-123');
      (state as any).lastPositiveMoment = oldTimestamp;

      // Force risk detection
      (engine as any).updateTrajectory('user-123');

      const updatedState = engine.getUserState('user-123');
      const sessionGapRisk = updatedState.riskFactors.find(r => r.type === 'SESSION_GAP');

      expect(sessionGapRisk).toBeDefined();
      expect(sessionGapRisk?.severity).toBe('CRITICAL');
    });

    it('should detect engagement drop risk', () => {
      // Force low momentum
      engine.recordEngagement('user-123', 'session_abandoned', 35);
      engine.recordEngagement('user-123', 'session_abandoned', 35);

      const state = engine.getUserState('user-123');
      const engagementRisk = state.riskFactors.find(r => r.type === 'ENGAGEMENT_DROP');

      expect(engagementRisk).toBeDefined();
      expect(engagementRisk?.severity).toBe('HIGH');
    });
  });

  describe('Intervention Generation', () => {
    it('should generate streak reminder for critical session gap', () => {
      // Simulate critical gap scenario
      engine.recordEngagement('user-123', 'session_completed', 20);
      const state = engine.getUserState('user-123');
      (state as any).lastPositiveMoment = Date.now() - 50 * 60 * 60 * 1000;

      // Add streak protective factor that would be at risk
      (state as any).protectiveFactors = [{
        type: 'STREAK_ACTIVE',
        strength: 20,
        description: '10-day streak',
      }];

      const interventions = (engine as any).generateInterventions(state);
      const streakReminder = interventions.find((i: any) => i.type === 'STREAK_REMINDER');

      expect(streakReminder).toBeDefined();
      expect(streakReminder?.priority).toBe(100);
    });

    it('should generate boss tease for active boss fights', () => {
      engine.recordEngagement('user-123', 'session_completed', 30);

      const state = engine.getUserState('user-123');
      (state as any).protectiveFactors = [{
        type: 'BOSS_NEAR_DEFEAT',
        strength: 85,
        description: 'Boss at 10% health',
      }];
      (state as any).momentumScore = 60;

      const interventions = (engine as any).generateInterventions(state);
      const bossTease = interventions.find((i: any) => i.type === 'BOSS_TEASE');

      expect(bossTease).toBeDefined();
    });

    it('should generate milestone preview for approaching milestones', () => {
      engine.recordEngagement('user-123', 'session_completed', 30);

      const state = engine.getUserState('user-123');
      (state as any).protectiveFactors = [{
        type: 'MILESTONE_CLOSE',
        strength: 90,
        description: '1 day from 30-day milestone',
      }];

      const interventions = (engine as any).generateInterventions(state);
      const milestonePreview = interventions.find((i: any) => i.type === 'MILESTONE_PREVIEW');

      expect(milestonePreview).toBeDefined();
    });

    it('should sort interventions by priority', () => {
      engine.recordEngagement('user-123', 'session_completed', 30);

      const state = engine.getUserState('user-123');
      // Critical gap = priority 100
      (state as any).riskFactors = [{
        type: 'SESSION_GAP',
        severity: 'CRITICAL',
        detectedAt: Date.now(),
        description: '50 hours since last session',
      }];
      // Boss tease would be priority 80
      (state as any).protectiveFactors = [{
        type: 'BOSS_NEAR_DEFEAT',
        strength: 85,
        description: 'Boss at 10%',
      }];

      const interventions = (engine as any).generateInterventions(state);

      expect(interventions[0].type).toBe('STREAK_REMINDER'); // Priority 100
      expect(interventions[0].priority).toBeGreaterThan(interventions[1]?.priority ?? 0);
    });
  });

  describe('Public API', () => {
    it('shouldShowStory returns false when at risk', () => {
      engine.recordEngagement('user-123', 'session_abandoned', 40);
      engine.recordEngagement('user-123', 'session_abandoned', 40);

      const shouldShow = engine.shouldShowStory('user-123');
      expect(shouldShow).toBe(false);
    });

    it('shouldShowStory returns true when stable', () => {
      engine.recordEngagement('user-123', 'session_completed', 30);

      const shouldShow = engine.shouldShowStory('user-123');
      expect(shouldShow).toBe(true);
    });

    it('getRecommendedSessionDuration returns 15 for low momentum', () => {
      engine.recordEngagement('user-123', 'session_abandoned', 40);

      const duration = engine.getRecommendedSessionDuration('user-123');
      expect(duration).toBe(15);
    });

    it('getRecommendedSessionDuration returns 25 for medium momentum', () => {
      engine.recordEngagement('user-123', 'session_completed', 10);

      const duration = engine.getRecommendedSessionDuration('user-123');
      expect(duration).toBe(25);
    });

    it('getRecommendedSessionDuration returns 45 for high momentum', () => {
      for (let i = 0; i < 5; i++) {
        engine.recordEngagement('user-123', 'session_completed', 20);
      }

      const duration = engine.getRecommendedSessionDuration('user-123');
      expect(duration).toBe(45);
    });
  });

  describe('Event Integration', () => {
    it('should emit trajectory change events', () => {
      const emitSpy = vi.spyOn(eventBus, 'publish');

      engine.initialize?.();

      // Trigger state change
      engine.recordEngagement('user-123', 'session_completed', 50);

      // Should have emitted trajectory change
      const trajectoryCall = emitSpy.mock.calls.find(
        call => call[0] === 'emotion:trajectory_changed'
      );

      expect(trajectoryCall).toBeDefined();
    });

    it('should emit retention intervention events', () => {
      const emitSpy = vi.spyOn(eventBus, 'publish');

      // Setup state that triggers intervention
      engine.recordEngagement('user-123', 'session_completed', 30);

      const state = engine.getUserState('user-123');
      (state as any).riskFactors = [{
        type: 'SESSION_GAP',
        severity: 'HIGH',
        detectedAt: Date.now(),
        description: '40 hours since last session',
      }];

      (engine as any).evaluateInterventions('user-123');

      const interventionCall = emitSpy.mock.calls.find(
        call => call[0] === 'retention:intervention_ready'
      );

      expect(interventionCall).toBeDefined();
    });
  });
});
