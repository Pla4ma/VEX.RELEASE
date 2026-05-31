import {
  recordConversion,
  getConversionRate,
  getBestConvertingContext,
} from '../conversion-tracking';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn() },
}));

const TEST_USER = 'test-user-001';

describe('monetization feature — comprehensive tests', () => {
  describe('conversion-tracking', () => {
    it('recordConversion does not throw', () => {
      expect(() =>
        recordConversion(TEST_USER, 'DEEP_COACH_MEMORY', true, 5000),
      ).not.toThrow();
    });
    it('getConversionRate returns 0 for no data', () => {
      const rate = getConversionRate('VISUAL_IDENTITY');
      expect(rate).toBe(0);
    });
    it('getBestConvertingContext returns a context after recordings', () => {
      const result = getBestConvertingContext();
      expect(result).toBe('DEEP_COACH_MEMORY');
    });
  });
});
