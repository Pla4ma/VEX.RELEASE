import { buildError, mapOfferingToDisplayInfo } from '../revenuecat-helpers';
import type { RevenueCatError, PurchasesOfferingDisplayInfo } from '../revenuecat-types';

jest.mock('react-native-purchases', () => ({}));

describe('revenuecat-helpers', () => {
  describe('buildError', () => {
    it('creates a RevenueCatError with code and message', () => {
      const error = buildError('PURCHASE_CANCELLED', 'User cancelled');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RevenueCatError');
      expect(error.code).toBe('PURCHASE_CANCELLED');
      expect(error.message).toBe('User cancelled');
    });

    it('creates errors for all error codes', () => {
      const codes = [
        'UNKNOWN', 'STORE_PROBLEM', 'PURCHASE_NOT_ALLOWED', 'PRODUCT_NOT_AVAILABLE',
        'NETWORK_ERROR', 'CONFIGURATION_ERROR', 'EMPTY_OFFERINGS',
      ] as const;
      for (const code of codes) {
        const error = buildError(code, `test-${code}`);
        expect(error.code).toBe(code);
      }
    });
  });

  describe('mapOfferingToDisplayInfo', () => {
    const createMockProduct = (overrides: Record<string, any> = {}) => ({
      identifier: overrides.productId ?? 'prod-monthly',
      description: 'Monthly subscription',
      title: 'Monthly',
      price: 9.99,
      priceString: '$9.99',
      currencyCode: 'USD',
      introPrice: null,
      discounts: null,
      ...overrides,
    });

    const createMockPackage = (pkgType: string, productOverrides: Record<string, any> = {}) => ({
      identifier: `pkg-${pkgType.toLowerCase()}`,
      packageType: pkgType,
      product: createMockProduct(productOverrides),
    });

    const createMockOffering = (overrides: Record<string, any> = {}) => ({
      identifier: 'offering-1',
      serverDescription: 'Main offering',
      metadata: { version: '1' },
      availablePackages: [] as any[],
      lifetime: null,
      annual: null,
      sixMonth: null,
      threeMonth: null,
      twoMonth: null,
      monthly: null,
      weekly: null,
      ...overrides,
    });

    it('maps empty offering', () => {
      const offering = createMockOffering();
      const result = mapOfferingToDisplayInfo(offering as any);
      expect(result.identifier).toBe('offering-1');
      expect(result.serverDescription).toBe('Main offering');
      expect(result.metadata).toEqual({ version: '1' });
      expect(result.packages).toEqual([]);
      expect(result.lifetime).toBeNull();
      expect(result.annual).toBeNull();
    });

    it('maps available packages', () => {
      const offering = createMockOffering({
        availablePackages: [
          createMockPackage('MONTHLY', { productId: 'prod-monthly' }),
          createMockPackage('ANNUAL', { productId: 'prod-annual', price: 79.99, priceString: '$79.99' }),
        ],
      });
      const result = mapOfferingToDisplayInfo(offering as any);
      expect(result.packages).toHaveLength(2);
      expect(result.packages[0].identifier).toBe('pkg-monthly');
      expect(result.packages[0].product.price).toBe(9.99);
      expect(result.packages[1].product.price).toBe(79.99);
    });

    it('maps named package slots', () => {
      const offering = createMockOffering({
        annual: createMockPackage('ANNUAL', { productId: 'prod-annual' }),
        lifetime: createMockPackage('LIFETIME', { productId: 'prod-lifetime', price: 299.99 }),
      });
      const result = mapOfferingToDisplayInfo(offering as any);
      expect(result.annual).not.toBeNull();
      expect(result.annual!.product.identifier).toBe('prod-annual');
      expect(result.lifetime).not.toBeNull();
      expect(result.lifetime!.product.price).toBe(299.99);
    });

    it('maps product with intro price', () => {
      const offering = createMockOffering({
        availablePackages: [
          createMockPackage('MONTHLY', {
            introPrice: {
              price: 0.99,
              priceString: '$0.99',
              period: 'P1M',
              cycles: 1,
              periodUnit: 'MONTH',
              periodNumberOfUnits: 1,
            },
          }),
        ],
      });
      const result = mapOfferingToDisplayInfo(offering as any);
      expect(result.packages[0].product.introPrice).not.toBeNull();
      expect(result.packages[0].product.introPrice!.price).toBe(0.99);
      expect(result.packages[0].product.introPrice!.cycles).toBe(1);
    });

    it('maps product with discounts', () => {
      const offering = createMockOffering({
        availablePackages: [
          createMockPackage('MONTHLY', {
            discounts: [{
              identifier: 'disc-1',
              price: 4.99,
              priceString: '$4.99',
              cycles: 3,
              period: 'P1M',
              periodUnit: 'MONTH',
              periodNumberOfUnits: 1,
            }],
          }),
        ],
      });
      const result = mapOfferingToDisplayInfo(offering as any);
      expect(result.packages[0].product.discounts).toHaveLength(1);
      expect(result.packages[0].product.discounts![0].identifier).toBe('disc-1');
    });

    it('filters out null packages from availablePackages', () => {
      const offering = createMockOffering({
        availablePackages: [
          createMockPackage('MONTHLY'),
          null as any,
        ],
      });
      const result = mapOfferingToDisplayInfo(offering as any);
      expect(result.packages).toHaveLength(1);
    });
  });
});
