import { eventBus } from '@/events';
import { recordSession } from '@/features/streaks/service';
import { createSessionSummary } from '../../session-completion/__tests__/ledger-test-utils';
import { generateStoryForCompletedSession, type StoryGeneratorContext } from '../StoryGenerator';
import * as storyRepository from '../repository';

jest.mock('@/events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../repository', () => ({
  saveStory: jest.fn(async () => {}),
}));

jest.mock('@/features/streaks/service', () => ({
  recordSession: jest.fn(async () => ({ newStreak: 1 })),
}));

jest.mock('../StoryBeatCalculator', () => ({
  calculateStory: jest.fn(() => ({
    beats: [
      {
        durationMs: 2500,
        emotion: 'TRIUMPH',
        hapticPattern: 'NONE',
        headline: 'Test Beat',
        id: '550e8400-e29b-41d4-a716-446655440001',
        sequenceOrder: 0,
        type: 'OPENING',
        visualCue: 'NONE',
      },
    ],
    nextSessionHooks: [],
    overallEmotion: 'TRIUMPH',
    subtitle: 'Test Subtitle',
    title: 'Test Story',
  })),
}));

jest.mock('../story-analytics', () => ({
  trackStoryEvent: jest.fn(),
}));

jest.mock('@/utils/debug', () => ({
  createDebugger: jest.fn(() => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

jest.mock('@/utils/uuid', () => ({
  v4: () => '550e8400-e29b-41d4-a716-446655440002',
}));

const sessionId = '550e8400-e29b-41d4-a716-446655440010';
const userId = '550e8400-e29b-41d4-a716-446655440020';

function storyContext(): StoryGeneratorContext {
  return {
    currentLevel: 1,
    sessionId,
    sessionSummary: createSessionSummary({
      actualDuration: 600000,
      effectiveDuration: 600000,
      sessionId,
      userId,
    }),
    sessionsToNextTier: 34,
    tierProgress: 0,
    userId,
    xpEarned: 0,
    xpToNextLevel: 100,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SessionStory explicit generation safety', () => {
  it('explicit story generation does not mutate streaks', async () => {
    await generateStoryForCompletedSession(storyContext());

    expect(recordSession).not.toHaveBeenCalled();
  });

  it('explicit story generation only writes the archived story record', async () => {
    await generateStoryForCompletedSession(storyContext());

    expect(storyRepository.saveStory).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledWith(
      'session:story:ready',
      expect.objectContaining({ sessionId, userId }),
    );
  });
});
