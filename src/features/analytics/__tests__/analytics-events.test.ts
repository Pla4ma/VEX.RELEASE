/**
 * Analytics Events Tests
 */

jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

import {
  emitInsightGenerated,
  emitInsightRead,
  emitPatternDetected,
  emitExportRequested,
  emitExportCompleted,
  emitExportFailed,
  emitDashboardUpdated,
  emitPreferencesChanged,
} from '../events';

// Use the same module path as the source
const { eventBus: mockEventBus } = require('../../../events/EventBus');

describe('Analytics Events', () => {
  it('emitInsightGenerated publishes event', () => {
    emitInsightGenerated('user-1', {
      id: 'insight-1',
      type: 'milestone_reached',
    } as unknown);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:insight_generated',
      expect.objectContaining({ userId: 'user-1', insightId: 'insight-1' }),
    );
  });

  it('emitInsightRead publishes event', () => {
    emitInsightRead('user-1', 'insight-1');
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:insight_read',
      expect.objectContaining({ userId: 'user-1', insightId: 'insight-1' }),
    );
  });

  it('emitPatternDetected publishes event', () => {
    emitPatternDetected('user-1', {
      id: 'pattern-1',
      type: 'anomaly',
      confidence: 0.9,
    } as unknown);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:pattern_detected',
      expect.objectContaining({
        userId: 'user-1',
        patternId: 'pattern-1',
        type: 'anomaly',
      }),
    );
  });

  it('emitExportRequested publishes event', () => {
    emitExportRequested({
      id: 'job-1',
      userId: 'user-1',
      format: 'json',
    } as unknown);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:export_requested',
      expect.objectContaining({ jobId: 'job-1', format: 'json' }),
    );
  });

  it('emitExportCompleted publishes event', () => {
    emitExportCompleted({
      id: 'job-1',
      userId: 'user-1',
      fileUrl: 'https://example.com/export.json',
    } as unknown);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:export_completed',
      expect.objectContaining({ jobId: 'job-1' }),
    );
  });

  it('emitExportFailed publishes event', () => {
    emitExportFailed('job-1', 'user-1', 'Network error');
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:export_failed',
      expect.objectContaining({ jobId: 'job-1', error: 'Network error' }),
    );
  });

  it('emitDashboardUpdated publishes event', () => {
    emitDashboardUpdated('user-1', 'dash-1', ['widget_added']);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:dashboard_updated',
      expect.objectContaining({ dashboardId: 'dash-1' }),
    );
  });

  it('emitPreferencesChanged publishes event', () => {
    emitPreferencesChanged('user-1', { timezone: 'UTC' });
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'analytics:preferences_changed',
      expect.objectContaining({ userId: 'user-1' }),
    );
  });
});
