/**
 * Achievements Service — initializeAchievementTracking Event Subscription Tests
 */

import { eventBus } from '../../events';
import { initializeAchievementTracking, updateAchievementProgress } from '../service';

jest.mock('../../events', () => ({
  eventBus: {
    subscribe: jest.fn(),
    publish: jest.fn(),
  },
}));

jest.mock('../repository', () => ({
  getUserAchievement: jest.fn().mockResolvedValue(null),
  updateAchievementProgress: jest.fn().mockResolvedValue({
    id: 'ua-1',
    userId: 'user-1',
    achievementId: 'ach-1',
    progress: 1,
    isUnlocked: false,
  }),
}));

jest.mock('../../shared/analytics/analytics-service', () => ({
  capture: jest.fn(),
}));

jest.mock('../definitions', () => ({
  ALL_ACHIEVEMENTS: [
    {
      id: 'session_master',
      title: 'Session Master',
      category: 'SESSION',
      rarity: 'COMMON',
      unlockCondition: { type: 'SESSION_COMPLETE', target: 10, comparator: 'CUMULATIVE' },
      progressMax: 10,
      reward: { xp: 100, coins: 50 },
    },
    {
      id: 'streak_warrior',
      title: 'Streak Warrior',
      category: 'STREAK',
      rarity: 'RARE',
      unlockCondition: { type: 'STREAK_DAYS', target: 7, comparator: 'GREATER_THAN' },
      progressMax: 7,
      reward: { xp: 200, coins: 100 },
    },
    {
      id: 'boss_slayer',
      title: 'Boss Slayer',
      category: 'BOSS',
      rarity: 'EPIC',
      unlockCondition: { type: 'BOSS_DEFEAT', target: 1, comparator: 'CUMULATIVE' },
      progressMax: 5,
      reward: { xp: 500 },
    },
    {
      id: 'duel_champion',
      title: 'Duel Champion',
      category: 'SOCIAL',
      rarity: 'RARE',
      unlockCondition: { type: 'DUEL_WIN', target: 3, comparator: 'CUMULATIVE' },
      progressMax: 3,
      reward: { xp: 300 },
    },
    {
      id: 'squad_member',
      title: 'Squad Member',
      category: 'SOCIAL',
      rarity: 'COMMON',
      unlockCondition: { type: 'SQUAD_JOIN', target: 1, comparator: 'CUMULATIVE' },
      progressMax: 1,
      reward: { xp: 50 },
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      category: 'SOCIAL',
      rarity: 'UNCOMMON',
      unlockCondition: { type: 'FRIEND_RECRUIT', target: 1, comparator: 'CUMULATIVE' },
      progressMax: 3,
      reward: { xp: 150 },
    },
    {
      id: 'focus_veteran',
      title: 'Focus Veteran',
      category: 'SESSION',
      rarity: 'UNCOMMON',
      unlockCondition: { type: 'FOCUS_MINUTES', target: 600, comparator: 'CUMULATIVE' },
      progressMax: 600,
      reward: { xp: 250 },
    },
  ],
}));

const mockedEventBus = jest.mocked(eventBus);

describe('initializeAchievementTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('subscribes to session:completed event', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledWith(
      'session:completed',
      expect.any(Function),
    );
  });

  it('subscribes to streak:updated event', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledWith(
      'streak:updated',
      expect.any(Function),
    );
  });

  it('subscribes to boss:defeated event', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledWith(
      'boss:defeated',
      expect.any(Function),
    );
  });

  it('subscribes to duel:completed event', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledWith(
      'duel:completed',
      expect.any(Function),
    );
  });

  it('subscribes to squad:joined event', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledWith(
      'squad:joined',
      expect.any(Function),
    );
  });

  it('subscribes to user:recruited event', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledWith(
      'user:recruited',
      expect.any(Function),
    );
  });

  it('subscribes to exactly 6 event types', () => {
    initializeAchievementTracking();
    expect(mockedEventBus.subscribe).toHaveBeenCalledTimes(6);
  });
});
