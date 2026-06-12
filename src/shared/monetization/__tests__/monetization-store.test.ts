import { useMonetizationStore } from '../store';

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
    const mockInfo = { id: 'ci-1' } as any;
    useMonetizationStore.getState().setCustomerInfo(mockInfo);
    expect(useMonetizationStore.getState().customerInfo).toBe(mockInfo);
  });

  it('sets entitlements and detects premium', () => {
    useMonetizationStore.getState().setEntitlements([
      { identifier: 'premium', isActive: true },
    ] as any);
    const state = useMonetizationStore.getState();
    expect(state.isPremium).toBe(true);
    expect(state.activeEntitlements).toHaveLength(1);
  });

  it('does not set premium for non-premium entitlement', () => {
    useMonetizationStore.getState().setEntitlements([
      { identifier: 'some_other', isActive: true },
    ] as any);
    expect(useMonetizationStore.getState().isPremium).toBe(false);
  });

  it('does not set premium for inactive premium entitlement', () => {
    useMonetizationStore.getState().setEntitlements([
      { identifier: 'premium', isActive: false },
    ] as any);
    expect(useMonetizationStore.getState().isPremium).toBe(false);
  });

  it('clears all state', () => {
    useMonetizationStore.getState().setIsPurchasing(true);
    useMonetizationStore.getState().setEntitlements([{ identifier: 'premium', isActive: true }] as any);
    useMonetizationStore.getState().setCustomerInfo({ id: 'ci' } as any);
    useMonetizationStore.getState().clear();
    const state = useMonetizationStore.getState();
    expect(state.isPurchasing).toBe(false);
    expect(state.isPremium).toBe(false);
    expect(state.activeEntitlements).toEqual([]);
    expect(state.customerInfo).toBeNull();
  });
});
