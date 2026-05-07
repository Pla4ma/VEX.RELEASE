/**
 * AI Coach Phase 7 Integration Tests
 * Phase 7 - P7-03 Verification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateMissionSuggestion,
  convertSuggestionToMission,
  generateSessionRecommendation,
  handleStreakRiskIntegration,
  shouldCoachShowSuggestion,
  getPriorityEngineState,
  getHomeCoachSuggestion,
  type CoachSuggestion,
  type PriorityEngine,
} from '../phase7-integration';
import { createMockCoachInput } from '../input-contract';
import { validateMessageQuality } from '../message-quality-gate';

// Mock dependencies
vi.mock('../../events', () => ({
  eventBus: {
    emit: vi.fn(),
  },
}));

vi.mock('../repository', () => ({
  fetchCoachState: vi.fn(),
  fetchRecentMessages: vi.fn(),
  createCoachMessage: vi.fn(),
  fetchUserMessages: vi.fn(),
}));

vi.mock('../service', () => ({
  generateMessage: vi.fn(),
}));

describe('Phase 7 Coach Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mission Suggestion Generation', () => {
    it('should generate mission suggestion when coach should intervene', async () => {
      const mockInput = createMockCoachInput({
        streakState: {
          currentStreak: 5,
          streakAtRisk: true,
          hoursSinceLastSession: 18,
          streakRecord: 12,
          missedDays: 0,
        },
      });

      const suggestion = await generateMissionSuggestion('user-123', mockInput);

      expect(suggestion).toBeDefined();
      expect(suggestion?.type).toBe('DAILY_MISSION');
      expect(suggestion?.canBecomeMission).toBe(true);
      expect(suggestion?.priority).toMatch(/high|critical/);
    });

    it('should return null when coach should stay quiet', async () => {
      const mockInput = createMockCoachInput({
        streakState: {
          currentStreak: 10,
          streakAtRisk: false,
          hoursSinceLastSession: 2,
          streakRecord: 15,
          missedDays: 0,
        },
      });

      const suggestion = await generateMissionSuggestion('user-123', mockInput);

      expect(suggestion).toBeNull();
    });

    it('should reject suggestions that fail quality gate', async () => {
      const mockInput = createMockCoachInput({
        streakState: {
          currentStreak: 3,
          streakAtRisk: true,
          hoursSinceLastSession: 20,
          streakRecord: 5,
          missedDays: 1,
        },
      });

      // Mock quality gate to reject
      vi.mocked(validateMessageQuality).mockReturnValue({
        messageId: 'test',
        content: 'Keep going!',
        category: 'SESSION_SUGGESTION',
        qualityElements: [],
        isGeneric: true,
        genericReasons: ['Generic pattern detected'],
        passesQualityGate: false,
        confidence: 0.2,
        suggestedAction: 'reject',
      });

      const suggestion = await generateMissionSuggestion('user-123', mockInput);

      expect(suggestion).toBeNull();
    });

    it('should create valid suggestion with all required fields', async () => {
      const mockInput = createMockCoachInput({
        streakState: {
          currentStreak: 7,
          streakAtRisk: true,
          hoursSinceLastSession: 16,
          streakRecord: 10,
          missedDays: 0,
        },
      });

      const suggestion = await generateMissionSuggestion('user-123', mockInput);

      expect(suggestion).toMatchObject({
        type: 'DAILY_MISSION',
        canBecomeMission: true,
        priority: expect.stringMatching(/critical|high|medium|low/),
        suggestedAction: expect.any(String),
        confidence: expect.any(Number),
        expiresAt: expect.any(Number),
        createdAt: expect.any(Number),
      });
    });
  });

  describe('Mission Conversion', () => {
    it('should convert valid suggestion to mission', async () => {
      const suggestion: CoachSuggestion = {
        id: 'suggestion-123',
        type: 'DAILY_MISSION',
        title: 'Protect Your Streak',
        description: 'Complete a 25-minute session to protect your 5-day streak',
        priority: 'high',
        suggestedAction: 'Start 25-minute session',
        confidence: 0.85,
        expiresAt: Date.now() + 86400000,
        createdAt: Date.now(),
        canBecomeMission: true,
      };

      const result = await convertSuggestionToMission('user-123', suggestion);

      expect(result.success).toBe(true);
      expect(result.missionId).toBeDefined();
      expect(result.missionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should reject suggestion that cannot become mission', async () => {
      const suggestion: CoachSuggestion = {
        id: 'suggestion-123',
        type: 'SESSION_RECOMMENDATION',
        title: 'Session Recommendation',
        description: 'Try a 25-minute session',
        priority: 'medium',
        suggestedAction: 'Start session',
        confidence: 0.7,
        expiresAt: Date.now() + 21600000,
        createdAt: Date.now(),
        canBecomeMission: false,
      };

      const result = await convertSuggestionToMission('user-123', suggestion);

      expect(result.success).toBe(false);
      expect(result.missionId).toBe('');
    });
  });

  describe('Session Recommendation', () => {
    it('should generate session recommendation based on patterns', async () => {
      const mockInput = createMockCoachInput({
        recentSessionGrades: [
          {
            sessionId: 'session-1',
            grade: 92,
            duration: 1800,
            completedAt: Date.now() - 86400000,
            difficulty: 'CHALLENGING',
          },
          {
            sessionId: 'session-2',
            grade: 88,
            duration: 1500,
            completedAt: Date.now() - 172800000,
            difficulty: 'CHALLENGING',
          },
        ],
        preferredSessionLengths: [1800],
      });

      const suggestion = await generateSessionRecommendation('user-123', mockInput);

      expect(suggestion).toBeDefined();
      expect(suggestion?.type).toBe('SESSION_RECOMMENDATION');
      expect(suggestion?.canBecomeMission).toBe(false);
      expect(suggestion?.title).toContain('30min CHALLENGING');
    });

    it('should return null with insufficient session data', async () => {
      const mockInput = createMockCoachInput({
        recentSessionGrades: [],
      });

      const suggestion = await generateSessionRecommendation('user-123', mockInput);

      expect(suggestion).toBeNull();
    });

    it('should adjust difficulty based on performance', async () => {
      const highPerformanceInput = createMockCoachInput({
        recentSessionGrades: [
          {
            sessionId: 'session-1',
            grade: 95,
            duration: 1800,
            completedAt: Date.now() - 86400000,
            difficulty: 'CHALLENGING',
          },
        ],
      });

      const suggestion = await generateSessionRecommendation('user-123', highPerformanceInput);

      expect(suggestion?.title).toContain('CHALLENGING');
    });
  });

  describe('Streak Risk Integration', () => {
    it('should generate streak protection suggestion for critical risk', async () => {
      const streakData = {
        currentStreak: 5,
        hoursSinceLastSession: 22,
        riskLevel: 'critical' as const,
      };

      const suggestion = await handleStreakRiskIntegration('user-123', streakData);

      expect(suggestion).toBeDefined();
      expect(suggestion?.type).toBe('STREAK_PROTECTION');
      expect(suggestion?.priority).toBe('critical');
      expect(suggestion?.canBecomeMission).toBe(true);
      expect(suggestion?.title).toBe('Protect Your Streak!');
    });

    it('should not intervene for low risk', async () => {
      const streakData = {
        currentStreak: 10,
        hoursSinceLastSession: 8,
        riskLevel: 'low' as const,
      };

      const suggestion = await handleStreakRiskIntegration('user-123', streakData);

      expect(suggestion).toBeNull();
    });

    it('should adjust expiration time based on urgency', async () => {
      const urgentData = {
        currentStreak: 3,
        hoursSinceLastSession: 10,
        riskLevel: 'high' as const,
      };

      const suggestion = await handleStreakRiskIntegration('user-123', urgentData);

      expect(suggestion?.expiresAt).toBeLessThan(Date.now() + (3 * 60 * 60 * 1000)); // Less than 3 hours
    });
  });

  describe('Priority Engine', () => {
    it('should not show coach suggestions when streak is critical', () => {
      const priorityState: PriorityEngine = {
        streakCritical: true,
        pendingSync: false,
        coachNextAction: false,
        dailyMissionReminder: false,
        squadHelp: false,
      };

      const shouldShow = shouldCoachShowSuggestion(priorityState, 'high');

      expect(shouldShow).toBe(false);
    });

    it('should not show coach suggestions when sync is pending', () => {
      const priorityState: PriorityEngine = {
        streakCritical: false,
        pendingSync: true,
        coachNextAction: false,
        dailyMissionReminder: false,
        squadHelp: false,
      };

      const shouldShow = shouldCoachShowSuggestion(priorityState, 'medium');

      expect(shouldShow).toBe(false);
    });

    it('should show critical coach suggestions even when other items exist', () => {
      const priorityState: PriorityEngine = {
        streakCritical: false,
        pendingSync: false,
        coachNextAction: false,
        dailyMissionReminder: true,
        squadHelp: false,
      };

      const shouldShow = shouldCoachShowSuggestion(priorityState, 'critical');

      expect(shouldShow).toBe(true);
    });

    it('should show high priority suggestions when no higher priority items exist', () => {
      const priorityState: PriorityEngine = {
        streakCritical: false,
        pendingSync: false,
        coachNextAction: false,
        dailyMissionReminder: false,
        squadHelp: false,
      };

      const shouldShow = shouldCoachShowSuggestion(priorityState, 'high');

      expect(shouldShow).toBe(true);
    });

    it('should not show low priority suggestions when other items exist', () => {
      const priorityState: PriorityEngine = {
        streakCritical: false,
        pendingSync: false,
        coachNextAction: false,
        dailyMissionReminder: true,
        squadHelp: false,
      };

      const shouldShow = shouldCoachShowSuggestion(priorityState, 'low');

      expect(shouldShow).toBe(false);
    });
  });

  describe('Home Screen Integration', () => {
    it('should return null when streak is critical', async () => {
      vi.mocked(require('../repository').fetchCoachState).mockResolvedValue({
        currentState: 'STREAK_AT_RISK',
        userId: 'user-123',
        personaId: 'default',
        preferences: {},
        lastUpdated: Date.now(),
      });
      vi.mocked(require('../repository').fetchRecentMessages).mockResolvedValue([]);

      const suggestion = await getHomeCoachSuggestion('user-123');

      expect(suggestion).toBeNull();
    });

    it('should return null when sync is pending', async () => {
      vi.mocked(require('../repository').fetchCoachState).mockResolvedValue({
        currentState: 'ACTIVE',
        userId: 'user-123',
        personaId: 'default',
        preferences: {},
        lastUpdated: Date.now(),
      });
      vi.mocked(require('../repository').fetchRecentMessages).mockResolvedValue([
        { status: 'PENDING', id: 'msg-1' }
      ]);

      const suggestion = await getHomeCoachSuggestion('user-123');

      expect(suggestion).toBeNull();
    });

    it('should return best suggestion when no higher priority items exist', async () => {
      vi.mocked(require('../repository').fetchCoachState).mockResolvedValue({
        currentState: 'ACTIVE',
        userId: 'user-123',
        personaId: 'default',
        preferences: {},
        lastUpdated: Date.now(),
      });
      vi.mocked(require('../repository').fetchRecentMessages).mockResolvedValue([]);

      // Mock quality gate to pass
      vi.mocked(validateMessageQuality).mockReturnValue({
        messageId: 'test',
        content: 'Your 5-day streak is at risk! Try a 25-minute session tonight.',
        category: 'STREAK_RISK',
        qualityElements: ['observed_behavior', 'specific_recommendation'],
        isGeneric: false,
        genericReasons: [],
        passesQualityGate: true,
        confidence: 0.85,
        suggestedAction: 'approve',
      });

      const suggestion = await getHomeCoachSuggestion('user-123');

      expect(suggestion).toBeDefined();
      expect(suggestion?.priority).toMatch(/critical|high|medium|low/);
      expect(suggestion?.confidence).toBeGreaterThan(0);
    });

    it('should not show generic empty panel', async () => {
      vi.mocked(require('../repository').fetchCoachState).mockResolvedValue({
        currentState: 'ACTIVE',
        userId: 'user-123',
        personaId: 'default',
        preferences: {},
        lastUpdated: Date.now(),
      });
      vi.mocked(require('../repository').fetchRecentMessages).mockResolvedValue([]);

      // Mock quality gate to reject all suggestions
      vi.mocked(validateMessageQuality).mockReturnValue({
        messageId: 'test',
        content: 'Keep going!',
        category: 'SESSION_SUGGESTION',
        qualityElements: [],
        isGeneric: true,
        genericReasons: ['Generic pattern detected'],
        passesQualityGate: false,
        confidence: 0.2,
        suggestedAction: 'reject',
      });

      const suggestion = await getHomeCoachSuggestion('user-123');

      expect(suggestion).toBeNull();
    });
  });

  describe('Analytics Tracking', () => {
    it('should track when suggestion is converted to mission', async () => {
      const { eventBus } = require('../../events');
      
      const suggestion: CoachSuggestion = {
        id: 'suggestion-123',
        type: 'DAILY_MISSION',
        title: 'Test Mission',
        description: 'Test description',
        priority: 'high',
        suggestedAction: 'Test action',
        confidence: 0.8,
        expiresAt: Date.now() + 86400000,
        createdAt: Date.now(),
        canBecomeMission: true,
      };

      await convertSuggestionToMission('user-123', suggestion);

      expect(eventBus.emit).toHaveBeenCalledWith('coach:suggestion_accepted', {
        userId: 'user-123',
        suggestionId: 'suggestion-123',
        action: 'mission_created',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input contract gracefully', async () => {
      const emptyInput = createMockCoachInput({
        recentSessionGrades: [],
        streakState: {
          currentStreak: 0,
          streakAtRisk: false,
          hoursSinceLastSession: 0,
          streakRecord: 0,
          missedDays: 0,
        },
      });

      const suggestion = await generateMissionSuggestion('user-123', emptyInput);

      expect(suggestion).toBeDefined();
    });

    it('should handle malformed streak data', async () => {
      const malformedData = {
        currentStreak: -1, // Invalid
        hoursSinceLastSession: -1, // Invalid
        riskLevel: 'invalid' as any,
      };

      const suggestion = await handleStreakRiskIntegration('user-123', malformedData);

      // Should handle gracefully without throwing
      expect(suggestion).toBeDefined();
    });

    it('should respect priority order in suggestions', async () => {
      vi.mocked(require('../repository').isStreakCritical).mockResolvedValue(false);
      vi.mocked(require('../repository').hasPendingSync).mockResolvedValue(false);
      vi.mocked(require('../repository').hasActiveDailyMission).mockResolvedValue(false);
      vi.mocked(require('../repository').squadNeedsHelp).mockResolvedValue(false);

      // Mock quality gate to pass all suggestions
      vi.mocked(validateMessageQuality).mockReturnValue({
        messageId: 'test',
        content: 'Quality message',
        category: 'SESSION_SUGGESTION',
        qualityElements: ['observed_behavior', 'specific_recommendation'],
        isGeneric: false,
        genericReasons: [],
        passesQualityGate: true,
        confidence: 0.8,
        suggestedAction: 'approve',
      });

      const suggestion = await getHomeCoachSuggestion('user-123');

      expect(suggestion).toBeDefined();
      // Should select the highest priority suggestion
      expect(['critical', 'high']).toContain(suggestion?.priority);
    });
  });
});