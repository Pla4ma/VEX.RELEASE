import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import type { MMKV } from "react-native-mmkv";
import React from "react";


export const PersistenceConfigs = {
  // Boss System
  bossPhaseStates: {
    key: 'boss:phase_states' as StorageKey,
    schema: z.record(z.any()),
    version: 1,
  },

  // Premium System
  subscriptions: {
    key: 'premium:subscriptions' as StorageKey,
    schema: z.record(z.any()),
    version: 1,
    encrypted: true,
  },

  paywallHistory: {
    key: 'premium:paywall_history' as StorageKey,
    schema: z.array(z.any()), // PaywallShowRecord
    version: 1,
  },

  // Shop System
  wallets: {
    key: 'shop:wallets' as StorageKey,
    schema: z.record(z.any()),
    version: 1,
    encrypted: true,
  },

  transactions: {
    key: 'shop:transactions' as StorageKey,
    schema: z.array(z.any()),
    version: 1,
  },

  inventories: {
    key: 'shop:inventories' as StorageKey,
    schema: z.record(z.any()), // UserInventory
    version: 1,
  },

  // Squad System
  squads: {
    key: 'squads:data' as StorageKey,
    schema: z.record(z.any()),
    version: 1,
  },

  // Notification System
  notificationHistory: {
    key: 'notifications:history' as StorageKey,
    schema: z.array(z.any()),
    version: 1,
  },

  scheduledNotifications: {
    key: 'notifications:scheduled' as StorageKey,
    schema: z.array(z.any()),
    version: 1,
  },

  // Onboarding System
  onboardingStates: {
    key: 'onboarding:states' as StorageKey,
    schema: z.record(z.any()),
    version: 1,
  },
};

export const persistence = new PersistenceService();

export function usePersistence<T>(config: PersistenceConfig<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await persistence.get(config);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [config]);

  const save = React.useCallback(
    async (newData: T) => {
      try {
        await persistence.set(config, newData);
        setData(newData);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Save failed'));
        return false;
      }
    },
    [config]
  );

  return { data, loading, error, save, refresh: () => persistence.get(config) };
}