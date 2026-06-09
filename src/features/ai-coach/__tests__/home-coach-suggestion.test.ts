import { beforeEach, describe, expect, it } from '@jest/globals';
import { getHomeCoachSuggestion } from '../integration';
import * as repository from '../repository';
import { validateMessageQuality } from '../message/message-quality-gate';

jest.mock('../repository', () => ({
  fetchCoachState: jest.fn(),
  fetchRecentMessages: jest.fn(),
}));

jest.mock('../message-quality-gate', () => ({
  validateMessageQuality: jest.fn(() => ({
    messageId: 'test',
    content: 'Your 5-day streak is at risk. Try a 25-minute session tonight.',
    category: 'STREAK_RISK',
    qualityElements: ['observed_behavior', 'specific_recommendation'],
    isGeneric: false,
    genericReasons: [],
    passesQualityGate: true,
    confidence: 0.85,
    suggestedAction: 'approve',
  })),
}));

const mockedRepository = jest.mocked(repository);
const mockedValidateMessageQuality = jest.mocked(validateMessageQuality, true);

function mockPassingQualityGate(): void {
  mockedValidateMessageQuality.mockReturnValue({
    messageId: 'test',
    content: 'Your 5-day streak is at risk. Try a 25-minute session tonight.',
    category: 'STREAK_RISK',
    qualityElements: ['observed_behavior', 'specific_recommendation'],
    isGeneric: false,
    genericReasons: [],
    passesQualityGate: true,
    confidence: 0.85,
    suggestedAction: 'approve',
  });
}

function mockCoachState(currentState: string): void {
  mockedRepository.fetchCoachState.mockResolvedValue({
    currentState,
    userId: 'user-123',
    personaId: 'default',
    preferences: {},
    lastUpdated: Date.now(),
  });
}

describe('Phase 7 home screen integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPassingQualityGate();
  });

  it('returns null when streak is critical', async () => {
    mockCoachState('STREAK_AT_RISK');
    mockedRepository.fetchRecentMessages.mockResolvedValue([]);

    await expect(getHomeCoachSuggestion('user-123')).resolves.toBeNull();
  });

  it('returns null when sync is pending', async () => {
    mockCoachState('ACTIVE');
    mockedRepository.fetchRecentMessages.mockResolvedValue([
      { status: 'SENT', id: 'msg-1' },
    ]);

    await expect(getHomeCoachSuggestion('user-123')).resolves.toBeNull();
  });

  it('returns best suggestion when no higher priority items exist', async () => {
    mockCoachState('ACTIVE');
    mockedRepository.fetchRecentMessages.mockResolvedValue([]);

    const suggestion = await getHomeCoachSuggestion('user-123');

    expect(suggestion).toBeDefined();
    expect(suggestion?.priority).toMatch(/critical|high|medium|low/);
    expect(suggestion?.confidence).toBeGreaterThan(0);
  });

  it('does not show generic empty panel', async () => {
    mockCoachState('ACTIVE');
    mockedRepository.fetchRecentMessages.mockResolvedValue([]);
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

    await expect(getHomeCoachSuggestion('user-123')).resolves.toBeNull();
  });

  it('respects priority order in suggestions', async () => {
    mockCoachState('ACTIVE');
    mockedRepository.fetchRecentMessages.mockResolvedValue([]);

    const suggestion = await getHomeCoachSuggestion('user-123');

    expect(suggestion).toBeDefined();
    expect(['critical', 'high', 'medium']).toContain(suggestion?.priority);
  });
});
