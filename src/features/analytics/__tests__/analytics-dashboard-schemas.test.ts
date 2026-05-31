/**
 * Dashboard Schema Tests
 */

import {
  DashboardWidgetSchema,
  DashboardLayoutSchema,
  ExportJobSchema,
  AnalyticsPreferencesSchema,
} from '../dashboard-schemas';

describe('Dashboard Schemas', () => {
  describe('DashboardWidgetSchema', () => {
    const validWidget = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'line_chart',
      title: 'Sessions Over Time',
      position: { x: 0, y: 0, w: 6, h: 4 },
      config: {},
      isVisible: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('accepts valid widget', () => {
      expect(() => DashboardWidgetSchema.parse(validWidget)).not.toThrow();
    });

    it('rejects widget with position width > 12', () => {
      expect(() =>
        DashboardWidgetSchema.parse({
          ...validWidget,
          position: { x: 0, y: 0, w: 13, h: 4 },
        }),
      ).toThrow();
    });

    it('rejects widget with empty title', () => {
      expect(() =>
        DashboardWidgetSchema.parse({ ...validWidget, title: '' }),
      ).toThrow();
    });
  });

  describe('DashboardLayoutSchema', () => {
    const validLayout = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'My Dashboard',
      isDefault: true,
      widgets: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('accepts valid layout', () => {
      expect(() => DashboardLayoutSchema.parse(validLayout)).not.toThrow();
    });

    it('rejects layout with empty name', () => {
      expect(() =>
        DashboardLayoutSchema.parse({ ...validLayout, name: '' }),
      ).toThrow();
    });
  });

  describe('ExportJobSchema', () => {
    const validJob = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      status: 'pending',
      format: 'json',
      dataTypes: ['sessions'],
      dateRange: { start: Date.now() - 86400000, end: Date.now() },
      progress: 0,
      createdAt: Date.now(),
    };

    it('accepts valid job', () => {
      expect(() => ExportJobSchema.parse(validJob)).not.toThrow();
    });

    it('rejects job with progress > 100', () => {
      expect(() =>
        ExportJobSchema.parse({ ...validJob, progress: 101 }),
      ).toThrow();
    });

    it('rejects job with empty dataTypes', () => {
      expect(() =>
        ExportJobSchema.parse({ ...validJob, dataTypes: [] }),
      ).toThrow();
    });

    it('accepts completed job with fileUrl', () => {
      const completed = {
        ...validJob,
        status: 'completed',
        progress: 100,
        fileUrl: 'https://example.com/export.json',
        completedAt: Date.now(),
      };
      expect(() => ExportJobSchema.parse(completed)).not.toThrow();
    });
  });

  describe('AnalyticsPreferencesSchema', () => {
    const validPrefs = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      defaultTimeRange: 'last_7_days',
      defaultDashboardId: '550e8400-e29b-41d4-a716-446655440001',
      emailReportsEnabled: false,
      emailReportFrequency: 'weekly',
      insightNotificationsEnabled: true,
      autoRefreshEnabled: true,
      autoRefreshInterval: 30000,
      currencyDisplay: 'both',
      timezone: 'America/New_York',
      updatedAt: Date.now(),
    };

    it('accepts valid preferences', () => {
      expect(() =>
        AnalyticsPreferencesSchema.parse(validPrefs),
      ).not.toThrow();
    });

    it('rejects autoRefreshInterval < 5000', () => {
      expect(() =>
        AnalyticsPreferencesSchema.parse({
          ...validPrefs,
          autoRefreshInterval: 1000,
        }),
      ).toThrow();
    });

    it('rejects invalid emailReportFrequency', () => {
      expect(() =>
        AnalyticsPreferencesSchema.parse({
          ...validPrefs,
          emailReportFrequency: 'hourly',
        }),
      ).toThrow();
    });
  });
});
