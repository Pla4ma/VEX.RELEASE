import { eventBus } from '@/events';
import { getStreakSummary, recordSession } from '@/features/streaks/service';
import type { SessionSummary } from '@/session/types';
import { createSessionSummary } from '../../session-completion/__tests__/ledger-test-utils';
import { buildStoryContext, initializeSessionStoryEngine } from '../SessionStoryEngine';
import * as storyRepository from '../repository';

jest.mock('@/events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../repository', () => ({
  fetchStoriesForUser: jest.fn(async () => []),
  fetchStoryBySessionId: jest.fn(async () => null),
  markStoryShared: jest.fn(async () => {}),
  markStoryViewed: jest.fn(async () => {}),
  saveStory: jest.fn(async () => {}),
}));

jest.mock('@/features/streaks/service', () => ({
  getStreakSummary: jest.fn(async () => ({
    currentDays: 5,
    frozenUntil: null,
    id: 's-1',
    isAtRisk: false,
    longestDays: 10,
    nextDeadline: null,
    riskLevel: 'NONE',
    shieldAvailable: false,
    userId: 'u-1',
  })),
  recordSession: jest.fn(async () => ({ newStreak: 1 })),
}));

jest.mock('@/features/boss/service', () => ({
  getActiveEncounter: jest.fn(async () => null),
}));

jest.mock('@/session/integration/SessionBossIntegration', () => ({
  calculateBossDamage: jest.fn(() => 0),
}));

jest.mock('@/utils/debug', () => ({
  createDebugger: jest.fn(() => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

const sessionId = '550e8400-e29b-41d4-a716-446655440010';
const userId = '550e8400-e29b-41d4-a716-446655440020';

function summary(): SessionSummary {
  return createSessionSummary({ sessionId, userId });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SessionStory archive import and engine safety', () => {
  it('importing session-story has no EventBus side effects', () => {
    expect(eventBus.subscribe).not.toHaveBeenCalled();
  });

  it('importing session-story does not call repository writes', () => {
    expect(storyRepository.saveStory).not.toHaveBeenCalled();
    expect(storyRepository.markStoryViewed).not.toHaveBeenCalled();
    expect(storyRepository.markStoryShared).not.toHaveBeenCalled();
  });

  it('initializeSessionStoryEngine does not subscribe by default', () => {
    const cleanup = initializeSessionStoryEngine();

    expect(eventBus.subscribe).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });

  it('buildStoryContext reads streak summary without mutating streaks', async () => {
    await buildStoryContext(sessionId, userId, summary());

    expect(getStreakSummary).toHaveBeenCalledWith(userId);
    expect(recordSession).not.toHaveBeenCalled();
  });
});
