export interface StorageProvider {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
    multiGet(keys: string[]): Promise<[string, unknown][]>;
    multiSet(items: [string, unknown][]): Promise<void>;
    clear(): Promise<void>;
}

export interface PersistenceConfig<T> {
    key: StorageKey;
    schema: z.ZodType<T>;
    encrypted?: boolean;
    ttl?: number;
    version?: number;
}

export interface PersistedItem<T> {
    data: T;
    version: number;
    savedAt: number;
    expiresAt?: number;
}

export type StorageKey = | 'boss:phase_states'
      | 'boss:taunt_history'
      // Premium System
      | 'premium:subscriptions'
      | 'premium:paywall_history'
      // Shop System
      | 'shop:wallets'
      | 'shop:transactions'
      | 'shop:inventories'
      // Squad System
      | 'squads:data'
      | 'squads:activity'
      // Notification System
      | 'notifications:history'
      | 'notifications:scheduled'
      | 'notifications:preferences'
      // Onboarding System
      | 'onboarding:states'
      | 'onboarding:feature_unlocks'
      // Analytics
      | 'analytics:metrics'
      | 'analytics:experiments'
      // Accessibility
      | 'accessibility:preferences';
