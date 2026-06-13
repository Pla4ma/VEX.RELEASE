import { useMonetizationStore } from '../store';
import type { EntitlementInfo, CustomerInfo } from '../revenuecat-types';

describe('useMonetizationStore', () => {
  beforeEach(() => {
    useMonetizationStore.getState().clear();
  });

  it('initializes with default state', () => {
    const state = useMonetizationStore.getState();
    expect(state.isPurchasing).toBe(false);
    expect(state.isPremium).toBe(false);
    expect(state.activeEntitlements).toEqual([]);
    expect(state.customerInfo).toBeNull();
  });

  it('sets purchasing state', () => {
    useMonetizationStore.getState().setIsPurchasing(true);
    expect(useMonetizationStore.getState().isPurchasing).toBe(true);
  });

  it('sets customer info', () => {
    const mockInfo = {} as CustomerInfo;
    useMonetizationStore.getState().setCustomerInfo(mockInfo);
    expect(useMonetizationStore.getState().customerInfo).toBe(mockInfo);
  });

  const makeEntitlement = (overrides: Partial<EntitlementInfo> = {}): EntitlementInfo => ({
    identifier: 'premium',
    isActive: true,
    willRenew: true,
    periodType: 'normal',
    latestPurchaseDate: '2025-01-01T00:00:00Z',
    originalPurchaseDate: '2025-01-01T00:00:00Z',
    expirationDate: '2026-01-01T00:00:00Z',
    store: 'app_store',
    productIdentifier: 'com.vex.premium',
    isSandbox: false,
    unsubscribeDetectedAt: null,
    billingIssueDetectedAt: null,
    ...overrides,
  });

  it('sets entitlements and detects premium', () => {
    useMonetizationStore.getState().setEntitlements([makeEntitlement()]);
    const state = useMonetizationStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.activeEntitlements).toHaveLength(1);
  });

  it('does not set premium for non-premium entitlement', () => {
    useMonetizationStore.getState().setEntitlements([makeEntitlement({ identifier: 'some_other' })]);
    expect(useMonetizationStore.getState().isPremium).toBe(false);
  });

  it('does not set premium for inactive premium entitlement', () => {
    useMonetizationStore.getState().setEntitlements([makeEntitlement({ isActive: false })]);
    expect(useMonetizationStore.getState().isPremium).toBe(false);
  });

  it('clears all state', () => {
    useMonetizationStore.getState().setIsPurchasing(true);
    useMonetizationStore.getState().setEntitlements([makeEntitlement()]);
    useMonetizationStore.getState().setCustomerInfo({} as CustomerInfo);
    useMonetizationStore.getState().clear();
    const state = useMonetizationStore.getState();
    expect(state.isPurchasing).toBe(false);
    expect(state.isPremium).toBe(false);
    expect(state.activeEntitlements).toEqual([]);
    expect(state.customerInfo).toBeNull();
  });
});