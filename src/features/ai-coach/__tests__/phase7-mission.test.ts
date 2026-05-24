import { beforeEach, describe, expect, it, vi } from '@jest/globals';
import { createMockCoachInput } from '../input-contract';
import { convertSuggestionToMission, generateMissionSuggestion } from '../phase7-integration';
import type { CoachSuggestion } from '../phase7-schemas';
import { validateMessageQuality } from '../message-quality-gate';
import { eventBus } from '../../../events';

jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));

jest.mock('../message-quality-gate', () => ({
  validateMessageQuality: jest.fn(() => ({
    messageId: 'test',
    content: 'Your 5-day streak is at risk. Try a 25-minute session tonight.',
    category: 'SESSION_SUGGESTION',
    qualityElements: ['observed_behavior', 'specific_recommendation'],
    isGeneric: false,
    genericReasons: [],
    passesQualityGate: true,
    confidence: 0.85,
    suggestedAction: 'approve',
  })),
}));

const mockedValidateMessageQuality = jest.mocked(validateMessageQuality);
const mockedPublish = jest.mocked(eventBus.publish);

describe('Phase 7 mission integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates mission suggestion when coach should intervene', async () => {
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

    expect(suggestion?.type).toBe('DAILY_MISSION');
    expect(suggestion?.canBecomeMission).toBe(true);
    expect(suggestion?.priority).toMatch(/high|critical/);
  });

  it('returns null when coach should stay quiet', async () => {
    const mockInput = createMockCoachInput({
      streakState: {
        currentStreak: 10,
        streakAtRisk: false,
        hoursSinceLastSession: 2,
        streakRecord: 15,
        missedDays: 0,
      },
    });

    await expect(generateMissionSuggestion('user-123', mockInput)).resolves.toBeNull();
  });

  it('rejects suggestions that fail quality gate', async () => {
    mockedValidateMessageQuality.mockReturnValue({
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

    const mockInput = createMockCoachInput({
      streakState: {
        currentStreak: 3,
        streakAtRisk: true,
        hoursSinceLastSession: 20,
        streakRecord: 5,
        missedDays: 1,
      },
    });

    await expect(generateMissionSuggestion('user-123', mockInput)).resolves.toBeNull();
  });

  it('converts valid suggestion to mission and tracks acceptance', async () => {
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
    expect(result.missionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(mockedPublish).toHaveBeenCalledWith('analytics:track', {
      event: 'vex_coach_suggestion_accepted',
      properties: {
        userId: 'user-123',
        suggestionId: 'suggestion-123',
        action: 'mission_created',
      },
      timestamp: expect.any(Number),
    });
  });

  it('rejects suggestion that cannot become mission', async () => {
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

    await expect(convertSuggestionToMission('user-123', suggestion)).resolves.toEqual({
      missionId: '',
      success: false,
    });
  });
});
