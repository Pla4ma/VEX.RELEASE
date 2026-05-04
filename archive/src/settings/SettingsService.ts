/**
 * Settings Service
 *
 * Manages user preferences and application settings.
 */

import { getStorageManager } from '../persistence';
import { eventBus } from '../events';
import type { Nullable } from '../types/global';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('settings');

/**
 * Setting category
 */
export type SettingCategory = 'general' | 'notifications' | 'privacy' | 'appearance' | 'storage';

/**
 * Setting value type
 */
export type SettingValue = string | number | boolean | string[] | object | null;

/**
 * Setting definition
 */
export interface Setting {
  key: string;
  value: SettingValue;
  category: SettingCategory;
  description?: string;
  lastModified: number;
}

/**
 * Settings configuration
 */
export interface SettingsConfig {
  storageKey?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

/**
 * Default settings
 */
const defaultSettings: Record<string, Setting> = {
  // General
  'general.language': {
    key: 'general.language',
    value: 'en',
    category: 'general',
    description: 'Application language',
    lastModified: 0,
  },
  'general.timezone': {
    key: 'general.timezone',
    value: 'UTC',
    category: 'general',
    description: 'User timezone',
    lastModified: 0,
  },

  // Notifications
  'notifications.push': {
    key: 'notifications.push',
    value: true,
    category: 'notifications',
    description: 'Enable push notifications',
    lastModified: 0,
  },
  'notifications.email': {
    key: 'notifications.email',
    value: true,
    category: 'notifications',
    description: 'Enable email notifications',
    lastModified: 0,
  },
  'notifications.sms': {
    key: 'notifications.sms',
    value: false,
    category: 'notifications',
    description: 'Enable SMS notifications',
    lastModified: 0,
  },

  // Privacy
  'privacy.profileVisibility': {
    key: 'privacy.profileVisibility',
    value: 'public',
    category: 'privacy',
    description: 'Profile visibility setting',
    lastModified: 0,
  },
  'privacy.showOnlineStatus': {
    key: 'privacy.showOnlineStatus',
    value: true,
    category: 'privacy',
    description: 'Show online status to others',
    lastModified: 0,
  },

  // Appearance
  'appearance.theme': {
    key: 'appearance.theme',
    value: 'system',
    category: 'appearance',
    description: 'App theme (light/dark/system)',
    lastModified: 0,
  },
  'appearance.fontScale': {
    key: 'appearance.fontScale',
    value: 1,
    category: 'appearance',
    description: 'Font scale factor',
    lastModified: 0,
  },

  // Storage
  'storage.autoDownload': {
    key: 'storage.autoDownload',
    value: true,
    category: 'storage',
    description: 'Auto download media',
    lastModified: 0,
  },
  'storage.cacheSize': {
    key: 'storage.cacheSize',
    value: 100, // MB
    category: 'storage',
    description: 'Cache size limit in MB',
    lastModified: 0,
  },
};

/**
 * Settings service
 */
export class SettingsService {
  private settings: Map<string, Setting> = new Map();
  private storage = getStorageManager();
  private config: Required<SettingsConfig>;
  private initialized = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: SettingsConfig = {}) {
    this.config = {
      storageKey: 'vex-settings',
      autoSync: true,
      syncInterval: 30000, // 30 seconds
      ...config,
    };
  }

  /**
   * Initialize settings service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {return;}

    await this.storage.initialize();

    // Load default settings
    Object.values(defaultSettings).forEach((setting) => {
      this.settings.set(setting.key, { ...setting });
    });

    // Load persisted settings
    await this.load();

    // Start auto sync
    if (this.config.autoSync) {
      this.startSync();
    }

    this.initialized = true;
  }

  /**
   * Load settings from storage
   */
  private async load(): Promise<void> {
    try {
      const data = await this.storage.getJSON<Record<string, Setting>>(this.config.storageKey);

      if (data) {
        Object.entries(data).forEach(([key, setting]) => {
          this.settings.set(key, setting);
        });
      }
    } catch (error) {
      debug.error('Failed to load settings', error as Error);
    }
  }

  /**
   * Save settings to storage
   */
  private async save(): Promise<void> {
    try {
      const data = Object.fromEntries(this.settings.entries());
      await this.storage.setJSON(this.config.storageKey, data);
    } catch (error) {
      debug.error('Failed to save settings', error as Error);
    }
  }

  /**
   * Start auto sync
   */
  private startSync(): void {
    this.syncTimer = setInterval(() => {
      this.save();
    }, this.config.syncInterval);
  }

  /**
   * Stop auto sync
   */
  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Get setting value
   */
  get<T extends SettingValue>(key: string, defaultValue?: T): T | undefined {
    const setting = this.settings.get(key);
    return (setting?.value as T) ?? defaultValue;
  }

  /**
   * Set setting value
   */
  async set<T extends SettingValue>(key: string, value: T): Promise<void> {
    const existing = this.settings.get(key);
    const category = existing?.category ?? this.inferCategory(key);

    const setting: Setting = {
      key,
      value,
      category,
      lastModified: Date.now(),
      description: existing?.description,
    };

    this.settings.set(key, setting);

    // Emit change event
    eventBus.publish('settings:change', {
      key,
      value,
      previousValue: existing?.value,
    });

    // Save immediately for important settings
    if (!this.config.autoSync) {
      await this.save();
    }
  }

  /**
   * Infer category from key
   */
  private inferCategory(key: string): SettingCategory {
    const prefix = key.split('.')[0];
    switch (prefix) {
      case 'notifications':
        return 'notifications';
      case 'privacy':
        return 'privacy';
      case 'appearance':
        return 'appearance';
      case 'storage':
        return 'storage';
      default:
        return 'general';
    }
  }

  /**
   * Get all settings by category
   */
  getByCategory(category: SettingCategory): Setting[] {
    return Array.from(this.settings.values()).filter(
      (s) => s.category === category
    );
  }

  /**
   * Get all settings
   */
  getAll(): Record<string, Setting> {
    return Object.fromEntries(this.settings.entries());
  }

  /**
   * Reset setting to default
   */
  async reset(key: string): Promise<void> {
    const defaultSetting = defaultSettings[key];

    if (defaultSetting) {
      await this.set(key, defaultSetting.value);
    } else {
      this.settings.delete(key);
      await this.save();
    }
  }

  /**
   * Reset all settings
   */
  async resetAll(): Promise<void> {
    this.settings.clear();

    Object.values(defaultSettings).forEach((setting) => {
      this.settings.set(setting.key, { ...setting });
    });

    await this.save();

    eventBus.publish('settings:reset', {});
  }

  /**
   * Check if setting exists
   */
  has(key: string): boolean {
    return this.settings.has(key);
  }

  /**
   * Delete setting
   */
  async delete(key: string): Promise<void> {
    this.settings.delete(key);
    await this.save();
  }

  /**
   * Export settings
   */
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import settings
   */
  async import(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson) as Record<string, Setting>;

      Object.entries(settings).forEach(([key, setting]) => {
        this.settings.set(key, setting);
      });

      await this.save();

      debug.info('[Settings] Imported', { count: Object.keys(settings).length });
    } catch (error) {
      debug.error('Failed to import settings:', error as Error);
      throw error;
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopSync();
    this.settings.clear();
  }
}

/**
 * Singleton instance
 */
let settingsServiceInstance: SettingsService | null = null;

export function getSettingsService(config?: SettingsConfig): SettingsService {
  if (!settingsServiceInstance) {
    settingsServiceInstance = new SettingsService(config);
  }
  return settingsServiceInstance;
}
