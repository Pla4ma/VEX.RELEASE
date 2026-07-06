import { z } from 'zod';
import type { PersistenceConfig, StorageKey } from './PersistenceService';

export const PersistenceConfigs = {
  bossPhaseStates: {
    key: 'boss:phase_states' as StorageKey,
    schema: z.record(z.string(), z.unknown()),
    version: 1,
  },
  subscriptions: {
    key: 'premium:subscriptions' as StorageKey,
    schema: z.record(z.string(), z.unknown()),
    version: 1,
    encrypted: true,
  },
  paywallHistory: {
    key: 'premium:paywall_history' as StorageKey,
    schema: z.array(z.unknown()),
    version: 1,
  },
  wallets: {
    key: 'shop:wallets' as StorageKey,
    schema: z.record(z.string(), z.unknown()),
    version: 1,
    encrypted: true,
  },
  transactions: {
    key: 'shop:transactions' as StorageKey,
    schema: z.array(z.unknown()),
    version: 1,
  },
  inventories: {
    key: 'shop:inventories' as StorageKey,
    schema: z.record(z.string(), z.unknown()),
    version: 1,
  },
  squads: {
    key: 'squads:data' as StorageKey,
    schema: z.record(z.string(), z.unknown()),
    version: 1,
  },
  notificationHistory: {
    key: 'notifications:history' as StorageKey,
    schema: z.array(z.unknown()),
    version: 1,
  },
  scheduledNotifications: {
    key: 'notifications:scheduled' as StorageKey,
    schema: z.array(z.unknown()),
    version: 1,
  },
  onboardingStates: {
    key: 'onboarding:states' as StorageKey,
    schema: z.record(z.string(), z.unknown()),
    version: 1,
  },
} satisfies Record<string, PersistenceConfig<unknown>>;
