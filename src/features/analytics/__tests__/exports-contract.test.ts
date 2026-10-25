import { buildExportData, exportAnalyticsData, resolveExportMetrics } from '../service/exports';
import { createExportJob } from '../repository/export-jobs';

jest.mock('../repository/export-jobs', () => ({
  createExportJob: jest.fn(),
  updateExportJobProgress: jest.fn().mockResolvedValue(undefined),
  markExportJobFailed: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../repository/time-series', () => ({ fetchTimeSeriesData: jest.fn().mockResolvedValue({ points: [], summary: {} }) }));
jest.mock('../repository/storage', () => ({
  uploadExportData: jest.fn().mockResolvedValue({ url: 'https://example.com/export', size: 1 }),
  deleteExportData: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../shared/hardening/retry', () => ({
  withRetry: (operation: () => Promise<unknown>) => operation(),
  CircuitBreaker: class { execute<T>(operation: () => Promise<T>) { return operation(); } },
}));
jest.mock('../../../shared/hardening/error-utils', () => ({ classifyError: jest.fn() }));
jest.mock('../../../utils/silent-failure', () => ({ captureSilentFailure: jest.fn() }));
jest.mock('../../../events/EventBus', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('@sentry/react-native', () => ({ addBreadcrumb: jest.fn(), captureException: jest.fn() }));

const mockedCreateExportJob = jest.mocked(createExportJob);
const dateRange = { start: 1_700_000_000_000, end: 1_700_086_400_000 };

describe('analytics export contract', () => {
  beforeEach(() => jest.clearAllMocks());

  it('persists the selected category, format, and date range on the export job', async () => {
    const job = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      status: 'pending' as const,
      format: 'csv' as const,
      dataTypes: ['achievements'],
      dateRange,
      progress: 0,
      createdAt: Date.now(),
    };
    mockedCreateExportJob.mockResolvedValue(job);

    await exportAnalyticsData(job.userId, 'csv', dateRange, ['achievements'], false);

    expect(mockedCreateExportJob).toHaveBeenCalledWith(expect.objectContaining({
      format: 'csv',
      dataTypes: ['achievements'],
      dateRange,
    }));
    expect(resolveExportMetrics(['achievements'])).toEqual([
      'boss_damage_dealt', 'bosses_defeated', 'rewards_claimed', 'challenges_completed',
    ]);
    expect(resolveExportMetrics(['sessions'])).toContain('sessions_completed');
    expect(resolveExportMetrics(['sessions'])).not.toContain('boss_damage_dealt');
  });

  it('includes or removes export metadata and point metadata as selected', () => {
    const metrics = ['sessions_completed'] as const;
    const results = [{
      points: [{ timestamp: dateRange.start, value: 4, metadata: { device: 'tablet' } }],
      summary: { total: 4 },
    }];
    const included = buildExportData(results, [...metrics], 'job-id', 'user-id', dateRange, 'json', true) as Record<string, unknown>;
    const excluded = buildExportData(results, [...metrics], 'job-id', 'user-id', dateRange, 'json', false) as Record<string, unknown>;

    expect(included).toHaveProperty('metadata');
    expect(included.sessions_completed).toEqual(results[0]);
    expect(excluded).not.toHaveProperty('metadata');
    expect(excluded.sessions_completed).toEqual({
      points: [{ timestamp: dateRange.start, value: 4 }],
      summary: { total: 4 },
    });
  });
});
