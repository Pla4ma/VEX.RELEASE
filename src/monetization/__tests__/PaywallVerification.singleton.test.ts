import {
  PaywallVerification,
  paywallVerification,
} from '../PaywallVerification';
import {
  RevenueCatService,
  revenueCatService,
} from '../../shared/monetization/revenuecat-service';

jest.mock('../../shared/monetization/revenuecat-service', () => ({
  revenueCatService: {
    initialize: jest.fn(),
    getStatus: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    getCustomerInfo: jest.fn(),
    getAnalyticsEvents: jest.fn(),
  },
}));

const _mockRevenueCatService =
  revenueCatService as jest.Mocked<RevenueCatService>;

describe('PaywallVerification', () => {
  let _verification: PaywallVerification;

  beforeEach(() => {
    verification = PaywallVerification.getInstance();
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PaywallVerification.getInstance();
      const instance2 = PaywallVerification.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(paywallVerification).toBeInstanceOf(PaywallVerification);
    });
  });
});
