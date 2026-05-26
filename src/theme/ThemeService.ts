import { captureSilentFailure } from '../utils/silent-failure';
/**
 * Theme Service
 *
 * Handles theme persistence, system integration, and event emission.
 */

import { type EventEmitter } from '../events/EventEmitter';
import { THEME_STORAGE_KEYS } from './config';
import type { ThemeMode } from './types';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('theme');

interface ThemeStorage {
  set(key: string, value: string): void;
  getString(key: string): string | undefined;
  delete(key: string): void;
}

const THEME_MODE_VALUES: readonly string[] = ['light', 'dark', 'system'];

function isThemeMode(value: string | undefined): value is ThemeMode {
  return typeof value === 'string' && THEME_MODE_VALUES.includes(value);
}

/**
 * Storage error for when MMKV fails
 */
class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Theme change event data
 */
export interface ThemeChangeEvent {
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark';
  timestamp: number;
}

/**
 * Theme Service class
 *
 * Manages theme persistence and cross-system communication.
 */
export class ThemeService {
  private storage: ThemeStorage | null = null;
  private eventEmitter: EventEmitter | null = null;
  private initialized = false;

  /**
   * Initialize the theme service
   */
  initialize(): void {
    if (this.initialized) {return;}

    try {
      // Dynamic import MMKV for Expo Go compatibility
      const { MMKV } = require('react-native-mmkv');
      this.storage = new MMKV({
        id: 'vex-theme-storage',
      });
      this.initialized = true;
    } catch (error) {
      throw new StorageError('MMKV not available - theme persistence disabled');
    }
  }

  /**
   * Set event emitter for broadcasting changes
   */
  setEventEmitter(emitter: EventEmitter): void {
    this.eventEmitter = emitter;
  }

  /**
   * Persist theme mode to storage
   */
  persistMode(mode: ThemeMode): void {
    try {
      this.storage?.set(THEME_STORAGE_KEYS.mode, mode);
    } catch (error) {
      throw new StorageError(`Failed to persist theme mode: ${error}`);
    }
  }

  /**
   * Get stored theme mode from storage
   */
  getStoredMode(): ThemeMode | null {
    try {
      const raw = this.storage?.getString(THEME_STORAGE_KEYS.mode);
      return raw !== undefined && isThemeMode(raw) ? raw : null;
    } catch (error) {
      debug.error('Failed to get stored theme mode', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Get stored mode (MMKV is synchronous)
   */
  async getStoredModeAsync(): Promise<ThemeMode | null> {
    return Promise.resolve(this.getStoredMode());
  }

  /**
   * Emit theme change event
   */
  emitThemeChange(mode: ThemeMode, effectiveMode: 'light' | 'dark'): void {
    const event: ThemeChangeEvent = {
      mode,
      effectiveMode,
      timestamp: Date.now(),
    };

    // Emit via event emitter if available
    this.eventEmitter?.emit('theme:change', event);

    // Also emit via global event bus
    const globalBus = (globalThis as Record<string, unknown>).eventBus;
    if (typeof globalBus === 'function') {
      globalBus('theme:change', event);
    }
  }

  /**
   * Clear stored theme preference
   */
  clearStoredMode(): void {
    try {
      this.storage?.delete(THEME_STORAGE_KEYS.mode);
    } catch (error) {
      debug.error('Failed to clear stored theme mode:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Check if system dark mode is available
   */
  isSystemDarkModeSupported(): boolean {
    // Check if Appearance API is available
    try {
      const { Appearance } = require('react-native');
      return Appearance !== undefined;
    } catch (error) { captureSilentFailure(error, { feature: 'theme', operation: 'network-fallback', type: 'network' });
      return false;
    }
  }

  /**
   * Get system color scheme
   */
  getSystemColorScheme(): 'light' | 'dark' | null {
    try {
      const { Appearance } = require('react-native');
      return Appearance.getColorScheme();
    } catch (error) { captureSilentFailure(error, { feature: 'theme', operation: 'network-fallback', type: 'network' });
      return null;
    }
  }

  /**
   * Subscribe to system appearance changes
   */
  subscribeToSystemChanges(callback: (colorScheme: 'light' | 'dark' | null) => void): () => void {
    try {
      const { Appearance } = require('react-native');
      const subscription = Appearance.addChangeListener(({ colorScheme }: { colorScheme: 'light' | 'dark' | null }) => {
        callback(colorScheme);
      });

      return () => subscription.remove();
    } catch (error) { captureSilentFailure(error, { feature: 'theme', operation: 'network-fallback', type: 'network' });
      return () => {
        // No-op if not supported
      };
    }
  }
}

/**
 * Singleton instance for app-wide use
 */
let themeServiceInstance: ThemeService | null = null;

/**
 * Get theme service singleton
 */
export function getThemeService(): ThemeService {
  if (!themeServiceInstance) {
    themeServiceInstance = new ThemeService();
  }
  return themeServiceInstance;
}
