import {
  trackBossEncounter,
  trackItemCrafted,
  initializeAnalytics,
} from '../integration';
import * as repository from '../repository';
import { eventBus } from '../../../events';
import * as sentry from '@sentry/react-native';
jest.mock('../repository');
jest.mock('../service', () => ({
  generateInsights: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
describe('AnalyticsIntegration – boss, crafting, init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('trackBossEncounter', () => {
    it('should track boss damage and generate insights on win', async () => {
      const { generateInsights } = jest.requireMock('../service');
      (repository.bulkInsertAnalyticsEvents as jest.Mock).mockResolvedValue(
        undefined,
      );
      await trackBossEncounter('user-123', {
        bossId: 'boss-1',
        damageDealt: 1500,
        won: true,
        duration: 600,
      });
      expect(repository.bulkInsertAnalyticsEvents).toHaveBeenCalledWith(
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
      const { generateInsights } = jest.requireMock('../service');
      (repository.bulkInsertAnalyticsEvents as jest.Mock).mockResolvedValue(
        undefined,
      );
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
      (repository.bulkInsertAnalyticsEvents as jest.Mock).mockResolvedValue(
        undefined,
      );
      await trackItemCrafted('user-123', {
        itemId: 'item-1',
        rarity: 'epic',
        coinsSpent: 500,
      });
      expect(repository.bulkInsertAnalyticsEvents).toHaveBeenCalledWith(
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
      (repository.fetchAggregatedStats as jest.Mock).mockResolvedValue({
        metrics: {
          sessions_completed: { value: 5 },
          xp_earned: { value: 500 },
          streak_days: { value: 7 },
        },
      });
      (repository.fetchInsights as jest.Mock).mockResolvedValue([]);
      (repository.fetchDetectedPatterns as jest.Mock).mockResolvedValue([]);
      const result = await initializeAnalytics('user-123');
      expect(result.success).toBe(true);
      expect(result.initialData).toBeDefined();
      expect(result.initialData?.todayStats.sessions).toBe(0);
      expect(result.initialData?.streak).toBe(0);
    });
    it('should handle initialization failure', async () => {
      (repository.fetchAggregatedStats as jest.Mock).mockRejectedValue(
        new Error('Database unavailable'),
      );
      const result = await initializeAnalytics('user-123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Database unavailable');
    });
  });
});
