import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CustomerInfo } from 'react-native-purchases';
import type { EntitlementInfo } from './revenuecat-types';

export type { EntitlementInfo } from './revenuecat-types';

interface MonetizationState {
  isPurchasing: boolean;
  isPremium: boolean;
  activeEntitlements: EntitlementInfo[];
  customerInfo: CustomerInfo | null;
  setIsPurchasing: (v: boolean) => void;
  setEntitlements: (e: EntitlementInfo[]) => void;
  setCustomerInfo: (info: CustomerInfo | null) => void;
  clear: () => void;
}

export const getRevenueCatStore = () => useMonetizationStore;

export const useMonetizationStore = create<MonetizationState>()(
  immer((set) => ({
    isPurchasing: false,
    isPremium: false,
    activeEntitlements: [],
    customerInfo: null,
    setIsPurchasing: (v) =>
      set((s) => {
        s.isPurchasing = v;
      }),
    setEntitlements: (e) =>
      set((s) => {
        s.activeEntitlements = e;
        s.isPremium = e.some(
          (ent) => ent.isActive && ent.identifier === 'premium',
        );
      }),
    setCustomerInfo: (info) =>
      set((s) => {
        s.customerInfo = info;
      }),
    clear: () =>
      set((s) => {
        s.isPremium = false;
        s.activeEntitlements = [];
        s.customerInfo = null;
        s.isPurchasing = false;
      }),
  })),
);
