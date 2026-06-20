import {
  trackBossEncounter,
  trackItemCrafted,
  initializeAnalytics,
} from '../integration';
import { eventBus } from '../../../events/EventBus';
jest.mock('../repository/stats', () => ({
  bulkInsertAnalyticsEvents: jest.fn().mockResolvedValue(undefined),
  fetchAggregatedStats: jest.fn().mockResolvedValue(null),
  fetchDetectedPatterns: jest.fn().mockResolvedValue([]),
}));
jest.mock('../repository/insights', () => ({
  fetchInsights: jest.fn().mockResolvedValue([]),
}));
jest.mock('../service/insights', () => ({
  generateInsights: jest.fn().mockResolvedValue([]),
}));
jest.mock('../realtime', () => ({
  getRealtimeAnalytics: jest.fn(),
}));
jest.mock('../../../events/EventBus', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
describe('AnalyticsIntegration – boss, crafting, init', () => {
  let bulkInsertAnalyticsEvents: jest.Mock;
  let fetchAggregatedStats: jest.Mock;
  let fetchInsights: jest.Mock;
  let fetchDetectedPatterns: jest.Mock;
  let generateInsights: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    
    const statsMock = jest.requireMock('../repository/stats');
    const insightsMock = jest.requireMock('../repository/insights');
    const serviceMock = jest.requireMock('../service/insights');
    
    bulkInsertAnalyticsEvents = statsMock.bulkInsertAnalyticsEvents;
    fetchAggregatedStats = statsMock.fetchAggregatedStats;
    fetchDetectedPatterns = statsMock.fetchDetectedPatterns;
    fetchInsights = insightsMock.fetchInsights;
    generateInsights = serviceMock.generateInsights;
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('trackBossEncounter', () => {
    it('should track boss damage and generate insights on win', async () => {
      bulkInsertAnalyticsEvents.mockResolvedValue(undefined);
      await trackBossEncounter('user-123', {
        bossId: 'boss-1',
        damageDealt: 1500,
        won: true,
        duration: 600,
      });
      expect(bulkInsertAnalyticsEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-123',
            metric_type: 'boss_damage_dealt',
            value: 1500,
          }),
        ]),
      );
      expect(generateInsights).toHaveBeenCalledWith('user-123');
      expect(eventBus.publish).toHaveBeenCalled();
    });
    it('should not generate insights on loss', async () => {
      bulkInsertAnalyticsEvents.mockResolvedValue(undefined);
      await trackBossEncounter('user-123', {
        bossId: 'boss-1',
        damageDealt: 500,
        won: false,
        duration: 300,
      });
      expect(generateInsights).not.toHaveBeenCalled();
    });
  });
  describe('trackItemCrafted', () => {
    it('should track item crafting and coin spending', async () => {
      bulkInsertAnalyticsEvents.mockResolvedValue(undefined);
      await trackItemCrafted('user-123', {
        itemId: 'item-1',
        rarity: 'epic',
        coinsSpent: 500,
      });
      expect(bulkInsertAnalyticsEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-123',
            metric_type: 'items_crafted',
            value: 1,
          }),
          expect.objectContaining({
            user_id: 'user-123',
            metric_type: 'coins_spent',
            value: 500,
          }),
        ]),
      );
    });
  });
  describe('initializeAnalytics', () => {
    it('should initialize successfully with data', async () => {
      fetchAggregatedStats.mockResolvedValue({
        metrics: {
          sessions_completed: { value: 5 },
          xp_earned: { value: 500 },
          streak_days: { value: 7 },
        },
      });
      fetchInsights.mockResolvedValue([]);
      fetchDetectedPatterns.mockResolvedValue([]);

      const realtimeMock = jest.requireMock('../realtime');
      realtimeMock.getRealtimeAnalytics.mockResolvedValue({
        today: { sessions: 5, xp: 500, focusTime: 3600 },
        streak: 7,
        level: 1,
        recentInsights: [],
      });

      const result = await initializeAnalytics('user-123');
      expect(result.success).toBe(true);
      expect(result.initialData).toBeDefined();
      expect(result.initialData?.todayStats.sessions).toBe(5);
      expect(result.initialData?.todayStats.xp).toBe(500);
      expect(result.initialData?.streak).toBe(7);
      expect(result.initialData?.level).toBe(1);
    });
    it('should handle initialization failure', async () => {
      fetchAggregatedStats.mockRejectedValue(new Error('Database unavailable'));
      const result = await initializeAnalytics('user-123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database unavailable');
    });
  });
});
