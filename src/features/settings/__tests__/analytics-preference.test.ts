const mockSetPreference = jest.fn();

jest.mock('../store', () => ({
  useSettingsStore: {
    getState: () => ({ analyticsEnabled: false, setPreference: mockSetPreference }),
  },
}));


import { analyticsService } from '../../../shared/analytics/analytics-service';
import {
  applyAnalyticsPreference,
  initializeAnalyticsPreference,
} from '../analytics-preference';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('analytics consent preference', () => {
  it('persists local opt-out and disables runtime analytics', () => {
    const setEnabled = jest.spyOn(analyticsService, 'setEnabled');
    const initialize = jest.spyOn(analyticsService, 'initialize');
    applyAnalyticsPreference(false);

    expect(mockSetPreference).toHaveBeenCalledWith('analyticsEnabled', false);
    expect(setEnabled).toHaveBeenCalledWith(false);
    expect(initialize).not.toHaveBeenCalled();
  });

  it('reinitializes runtime analytics when the user opts in', () => {
    const setEnabled = jest.spyOn(analyticsService, 'setEnabled');
    const initialize = jest.spyOn(analyticsService, 'initialize').mockResolvedValue(true);
    applyAnalyticsPreference(true);

    expect(mockSetPreference).toHaveBeenCalledWith('analyticsEnabled', true);
    expect(setEnabled).toHaveBeenCalledWith(true);
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('honors the persisted local choice during app startup', async () => {
    const setEnabled = jest.spyOn(analyticsService, 'setEnabled');
    const initialize = jest.spyOn(analyticsService, 'initialize').mockResolvedValue(true);
    await expect(initializeAnalyticsPreference()).resolves.toBe(true);

    expect(setEnabled).toHaveBeenCalledWith(false);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(mockSetPreference).not.toHaveBeenCalled();
  });
});
