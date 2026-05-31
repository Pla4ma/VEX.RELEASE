import { type EventEmitter } from '../events/EventEmitter';
import { THEME_STORAGE_KEYS } from './config';
import type { ThemeMode } from './types';
import { createDebugger } from '../utils/debug';

export const debug = createDebugger('theme');

export interface ThemeStorage {
  set(key: string, value: string): void;
  getString(key: string): string | undefined;
  delete(key: string): void;
}

const THEME_MODE_VALUES: readonly string[] = ['light', 'dark', 'system'];

export function isThemeMode(value: string | undefined): value is ThemeMode {
  return typeof value === 'string' && THEME_MODE_VALUES.includes(value);
}

/**
 * Storage error for when MMKV fails
 */
export class StorageError extends Error {
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
