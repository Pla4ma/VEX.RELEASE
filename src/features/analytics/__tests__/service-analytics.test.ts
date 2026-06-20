import {
  getAnalyticsData,
} from '../service';
import * as timeSeriesRepository from '../repository/time-series';

jest.mock('../repository/time-series');

jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnalyticsData', () => {
    it('should fetch data for multiple metrics', async () => {
      const mockTimeSeriesData = {
        metric: 'sessions_completed',
        granularity: 'day',
        points: [
          { timestamp: Date.now() - 86400000, value: 5 },
          { timestamp: Date.now(), value: 3 },
        ],
        summary: {
          total: 8,
          average: 4,
          min: 3,
          max: 5,
          change: 0,
          changePercent: 0,
        },
      };
      (timeSeriesRepository.fetchTimeSeriesData as jest.Mock).mockResolvedValue(
        mockTimeSeriesData,
      );
      const result = await getAnalyticsData({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        metrics: ['sessions_completed', 'xp_earned'],
        timeRange: 'last_7_days',
        granularity: 'day',
      });
      expect(result).toHaveLength(2);
      expect(timeSeriesRepository.fetchTimeSeriesData).toHaveBeenCalledTimes(2);
    });

    it('should apply dimensions and filters', async () => {
      const mockTimeSeriesData = {
        metric: 'sessions_completed',
        granularity: 'day',
        points: [],
        summary: {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          change: 0,
          changePercent: 0,
        },
      };
      (timeSeriesRepository.fetchTimeSeriesData as jest.Mock).mockResolvedValue(
        mockTimeSeriesData,
      );
      await getAnalyticsData({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        metrics: ['sessions_completed'],
        timeRange: 'last_7_days',
        granularity: 'day',
        dimensions: ['day_of_week'],
        filters: [{ dimension: 'day_of_week', operator: 'eq', value: '1' }],
      });
      expect(timeSeriesRepository.fetchTimeSeriesData).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'sessions_completed',
        'last_7_days',
        'day',
        ['day_of_week'],
        [{ dimension: 'day_of_week', operator: 'eq', value: '1' }],
      );
    });

    it('should throw on validation error', async () => {
      await expect(
        getAnalyticsData({
          userId: 'invalid-uuid',
          metrics: [],
          timeRange: 'last_7_days',
          granularity: 'day',
        }),
      ).rejects.toThrow();
    });
  });
});
