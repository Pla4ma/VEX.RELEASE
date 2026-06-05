import {
  getRevenueCatStore,
  useMonetizationStore,
} from '../store';
import type { EntitlementInfo } from '../revenuecat-types';

const activePremium: EntitlementInfo = {
  identifier: 'premium',
  isActive: true,
  willRenew: true,
  latestPurchaseDate: '2026-05-01T00:00:00.000Z',
  originalPurchaseDate: '2026-05-01T00:00:00.000Z',
  expirationDate: null,
  store: 'APP_STORE',
  productIdentifier: 'vex.premium.monthly',
  isSandbox: true,
  unsubscribeDetectedAt: null,
  billingIssueDetectedAt: null,
};

describe('getRevenueCatStore synchronous access', () => {
  beforeEach(() => {
    useMonetizationStore.getState().clear();
  });

  it('returns the same store instance as useMonetizationStore', () => {
    expect(getRevenueCatStore()).toBe(useMonetizationStore);
  });

  it('getState() works outside React components', () => {
    const store = getRevenueCatStore();
    const state = store.getState();

    expect(state.isPremium).toBe(false);
    expect(state.activeEntitlements).toEqual([]);
    expect(state.isPurchasing).toBe(false);
    expect(state.customerInfo).toBeNull();
  });

  it('reflects entitlement state set via setEntitlements', () => {
    const store = getRevenueCatStore();

    useMonetizationStore.getState().setEntitlements([activePremium]);

    expect(store.getState().isPremium).toBe(true);
    expect(store.getState().activeEntitlements).toEqual([activePremium]);
  });

  it('clear() resets all state', () => {
    const store = getRevenueCatStore();

    useMonetizationStore.getState().setEntitlements([activePremium]);
    useMonetizationStore.getState().setIsPurchasing(true);

    expect(store.getState().isPremium).toBe(true);
    expect(store.getState().isPurchasing).toBe(true);

    useMonetizationStore.getState().clear();

    expect(store.getState().isPremium).toBe(false);
    expect(store.getState().isPurchasing).toBe(false);
    expect(store.getState().activeEntitlements).toEqual([]);
  });
});
