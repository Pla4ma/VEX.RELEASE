import { eventBus } from '../../events/EventBus';
import { initializeAchievementTracking } from '../service';

jest.mock('../../events/EventBus', () => ({ eventBus: { subscribe: jest.fn(), publish: jest.fn() } }));
jest.mock('../repository', () => ({
  getUserAchievement: jest.fn().mockResolvedValue(null),
  updateAchievementProgress: jest.fn().mockResolvedValue({ id: 'ua-1', isUnlocked: false }),
}));
jest.mock('../../../shared/analytics/analytics-service', () => ({ capture: jest.fn() }));
jest.mock('../definitions', () => ({
  ALL_ACHIEVEMENTS: [
    { id: 's1', unlockCondition: { type: 'SESSION_COMPLETE', target: 1, comparator: 'CUMULATIVE' }, progressMax: 1, reward: {} },
    { id: 's2', unlockCondition: { type: 'STREAK_DAYS', target: 1, comparator: 'GREATER_THAN' }, progressMax: 1, reward: {} },
    { id: 's3', unlockCondition: { type: 'BOSS_DEFEAT', target: 1, comparator: 'CUMULATIVE' }, progressMax: 1, reward: {} },
    { id: 's4', unlockCondition: { type: 'DUEL_WIN', target: 1, comparator: 'CUMULATIVE' }, progressMax: 1, reward: {} },
    { id: 's5', unlockCondition: { type: 'SQUAD_JOIN', target: 1, comparator: 'CUMULATIVE' }, progressMax: 1, reward: {} },
    { id: 's6', unlockCondition: { type: 'FRIEND_RECRUIT', target: 1, comparator: 'CUMULATIVE' }, progressMax: 1, reward: {} },
    { id: 's7', unlockCondition: { type: 'FOCUS_MINUTES', target: 1, comparator: 'CUMULATIVE' }, progressMax: 1, reward: {} },
  ],
}));

describe('initializeAchievementTracking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('subscribes to session:completed', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledWith('session:completed', expect.any(Function));
  });
  it('subscribes to streak:updated', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledWith('streak:updated', expect.any(Function));
  });
  it('subscribes to boss:defeated', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledWith('boss:defeated', expect.any(Function));
  });
  it('subscribes to duel:completed', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledWith('duel:completed', expect.any(Function));
  });
  it('subscribes to squad:joined', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledWith('squad:joined', expect.any(Function));
  });
  it('subscribes to user:recruited', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledWith('user:recruited', expect.any(Function));
  });
  it('subscribes to exactly 6 events', () => {
    initializeAchievementTracking();
    expect(eventBus.subscribe).toHaveBeenCalledTimes(6);
  });
});
