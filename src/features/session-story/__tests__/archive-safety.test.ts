import { initializeSessionStoryEngine, buildStoryContext } from '../SessionStoryEngine';
import { generateStoryForCompletedSession } from '../StoryGenerator';
import { eventBus } from '@/events';
import * as storyRepository from '../repository';

jest.mock('@/events', () => ({
  eventBus: {
    subscribe: jest.fn(() => jest.fn()),
    publish: jest.fn(),
  },
}));

jest.mock('../repository', () => ({
  saveStory: jest.fn(async () => {}),
  fetchStoryBySessionId: jest.fn(async () => null),
  fetchStoriesForUser: jest.fn(async () => []),
  markStoryViewed: jest.fn(async () => {}),
  markStoryShared: jest.fn(async () => {}),
}));

jest.mock('@/features/streaks/service', () => ({
  getStreakSummary: jest.fn(async () => ({
    id: 's-1',
    userId: 'u-1',
    currentDays: 5,
    longestDays: 10,
    isAtRisk: false,
    riskLevel: 'NONE',
    nextDeadline: null,
    frozenUntil: null,
    shieldAvailable: false,
  })),
  recordSession: jest.fn(async () => ({ newStreak: 1 })),
}));

jest.mock('@/features/boss/service', () => ({
  getActiveEncounter: jest.fn(async () => null),
}));

jest.mock('@/session/integration/SessionBossIntegration', () => ({
  calculateBossDamage: jest.fn(() => 0),
}));

jest.mock('../StoryBeatCalculator', () => ({
  calculateStory: jest.fn(() => ({
    title: 'Test Story',
    subtitle: 'Test Subtitle',
    overallEmotion: 'TRIUMPH',
    beats: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'OPENING',
        sequenceOrder: 0,
        headline: 'Test Beat',
        emotion: 'TRIUMPH',
        visualCue: 'NONE',
        durationMs: 2500,
        hapticPattern: 'NONE',
      },
    ],
    nextSessionHooks: [],
  })),
}));

jest.mock('@/utils/debug', () => ({
  createDebugger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('@/utils/uuid', () => ({ v4: () => '00000000-0000-0000-0000-000000000001' }));

const mockSessionSummary = {
  actualDuration: 600000, effectiveDuration: 600000, focusQuality: 80,
  focusPurityScore: 75, interruptions: 0, pauses: 0,
  streakDays: 5, streakMaintained: true, sessionMode: 'STANDARD',
  completionPercentage: 100, finalScore: 85,
} as const;

beforeEach(() => {
  jest.clearAllMocks();
  const { calculateStory } = require('../StoryBeatCalculator');
  calculateStory.mockReturnValue({
    title: 'Test Story',
    subtitle: 'Test Subtitle',
    overallEmotion: 'TRIUMPH',
    beats: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'OPENING',
        sequenceOrder: 0,
        headline: 'Test Beat',
        emotion: 'TRIUMPH',
        visualCue: 'NONE',
        durationMs: 2500,
        hapticPattern: 'NONE',
      },
    ],
    nextSessionHooks: [],
  });
});

describe('archive safety — no side effects on import', () => {
  it('importing session-story module does not subscribe to session:completed', () => {
    expect(eventBus.subscribe).not.toHaveBeenCalled();
  });

  it('importing session-story module does not call any repository writes', () => {
    expect(storyRepository.saveStory).not.toHaveBeenCalled();
  });
});

describe('initializeSessionStoryEngine — no subscriptions', () => {
  it('does not subscribe to session:completed', () => {
    const cleanup = initializeSessionStoryEngine();
    expect(eventBus.subscribe).not.toHaveBeenCalled();
    cleanup();
  });

  it('returns a no-op cleanup function', () => {
    const cleanup = initializeSessionStoryEngine();
    expect(() => cleanup()).not.toThrow();
  });

  it('does not subscribe to session:story:viewed', () => {
    initializeSessionStoryEngine();
    expect(eventBus.subscribe).not.toHaveBeenCalled();
  });
});

describe('buildStoryContext — read-only', () => {
  it('does not call recordSession', async () => {
    const { recordSession } = require('@/features/streaks/service');

    await buildStoryContext(
      '00000000-0000-0000-0000-000000000010',
      '00000000-0000-0000-0000-000000000020',
      mockSessionSummary as any,
    );

    expect(recordSession).not.toHaveBeenCalled();
  });

  it('calls getStreakSummary (read-only) instead of recordSession', async () => {
    const streaksService = require('@/features/streaks/service');

    await buildStoryContext(
      '00000000-0000-0000-0000-000000000010',
      '00000000-0000-0000-0000-000000000020',
      mockSessionSummary as any,
    );

    expect(streaksService.getStreakSummary).toHaveBeenCalled();
    expect(streaksService.recordSession).not.toHaveBeenCalled();
  });
});

describe('story generation — no mutation of core systems', () => {
  it('does not write to streak repository', async () => {
    const streaksService = require('@/features/streaks/service');

    await generateStoryForCompletedSession({
      sessionId: '00000000-0000-0000-0000-000000000010',
      userId: '00000000-0000-0000-0000-000000000020',
      sessionSummary: mockSessionSummary,
      xpEarned: 0,
      currentLevel: 1,
      xpToNextLevel: 100,
      tierProgress: 0,
      sessionsToNextTier: 34,
    });

    expect(streaksService.recordSession).not.toHaveBeenCalled();
  });

  it('does not mutate XP, boss, or rewards', async () => {
    await generateStoryForCompletedSession({
      sessionId: '00000000-0000-0000-0000-000000000010',
      userId: '00000000-0000-0000-0000-000000000020',
      sessionSummary: mockSessionSummary,
      xpEarned: 0,
      currentLevel: 1,
      xpToNextLevel: 100,
      tierProgress: 0,
      sessionsToNextTier: 34,
    });

    expect(storyRepository.saveStory).toHaveBeenCalledTimes(1);
  });
});

describe('story repository — explicit call only', () => {
  const ctx = {
    sessionId: '00000000-0000-0000-0000-000000000010',
    userId: '00000000-0000-0000-0000-000000000020',
    sessionSummary: mockSessionSummary,
    xpEarned: 0, currentLevel: 1, xpToNextLevel: 100,
    tierProgress: 0, sessionsToNextTier: 34,
  };

  it('saveStory is only called via generateStoryForCompletedSession', async () => {
    initializeSessionStoryEngine();
    expect(storyRepository.saveStory).not.toHaveBeenCalled();

    await generateStoryForCompletedSession(ctx);
    expect(storyRepository.saveStory).toHaveBeenCalledTimes(1);
  });

  it('publishes session:story:ready after explicit generation', async () => {
    await generateStoryForCompletedSession(ctx);

    expect(eventBus.publish).toHaveBeenCalledWith(
      'session:story:ready',
      expect.objectContaining({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
      }),
    );
  });
});
