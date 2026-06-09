/**
 * Tests for session-events feature: analytics trackMidSessionEvent.
 */

import * as sentry from '@sentry/react-native';
import { trackMidSessionEvent } from '../analytics';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

const mockSentry = jest.requireMock('@sentry/react-native') as {
  addBreadcrumb: jest.Mock;
};

describe('analytics – trackMidSessionEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends breadcrumb with event type', () => {
    trackMidSessionEvent({
      key: 'test:1',
      type: 'PURITY_PULSE',
      title: 'Focus holding',
      message: 'Test message',
      toastType: 'info',
      haptic: 'selection',
    });
    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'session-events',
        message: 'PURITY_PULSE',
        level: 'info',
      }),
    );
  });

  it('sends warning level breadcrumb for warning toastType', () => {
    trackMidSessionEvent({
      key: 'test:2',
      type: 'DISTRACTION_WAVE',
      title: 'Distraction wave',
      message: 'Test',
      toastType: 'warning',
      haptic: 'warning',
    });
    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'session-events',
        message: 'DISTRACTION_WAVE',
        level: 'warning',
      }),
    );
  });

  it('sends info level breadcrumb for success toastType', () => {
    trackMidSessionEvent({
      key: 'test:3',
      type: 'COMBO_WINDOW',
      title: 'Combo',
      message: 'Test',
      toastType: 'success',
      haptic: 'impactMedium',
    });
    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info' }),
    );
  });
});
