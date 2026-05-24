import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import {
  BehaviorSignalSchema,
  type BehaviorSignal,
  type BehaviorSignalType,
  type BehaviorSignalSource,
} from './behavior-signal-schemas';

const SIGNAL_KEY_PREFIX = 'vex_behavior_signals:';

interface StoredSignalWindow {
  signals: BehaviorSignal[];
  updatedAt: number;
}

const StoredSignalWindowSchema = z.object({
  signals: z.array(BehaviorSignalSchema).max(200),
  updatedAt: z.number().int().min(0),
}).strict();

function getWindowKey(userId: string): string {
  return `${SIGNAL_KEY_PREFIX}${userId}:window`;
}

let mmkvAdapter: { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void } | null = null;

function getStorage(): NonNullable<typeof mmkvAdapter> {
  if (mmkvAdapter) return mmkvAdapter;
  try {
    const { getMMKVStorageAdapter } = require('../../persistence/MMKVStorageAdapter');
    mmkvAdapter = getMMKVStorageAdapter();
    return mmkvAdapter!;
  } catch {
    const fallback: Record<string, string> = {};
    mmkvAdapter = {
      getItem: (key: string) => fallback[key] ?? null,
      setItem: (key: string, value: string) => { fallback[key] = value; },
      removeItem: (key: string) => { delete fallback[key]; },
    };
    return mmkvAdapter;
  }
}

function loadWindow(userId: string): StoredSignalWindow {
  try {
    const raw = getStorage().getItem(getWindowKey(userId));
    if (!raw) return { signals: [], updatedAt: 0 };
    return StoredSignalWindowSchema.parse(JSON.parse(raw));
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'behavior-signals',
      message: 'Failed to load signal window, resetting',
      level: 'warning',
    });
    getStorage().removeItem(getWindowKey(userId));
    return { signals: [], updatedAt: 0 };
  }
}

function saveWindow(userId: string, window: StoredSignalWindow): void {
  try {
    getStorage().setItem(getWindowKey(userId), JSON.stringify(window));
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'behavior-signals',
      message: 'Failed to persist signal window',
      level: 'warning',
    });
  }
}

const MAX_WINDOW_SIGNALS = 100;
const WINDOW_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

function pruneOldSignals(signals: BehaviorSignal[]): BehaviorSignal[] {
  const cutoff = Date.now() - WINDOW_MAX_AGE_MS;
  return signals
    .filter((s) => s.timestamp > cutoff)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_WINDOW_SIGNALS);
}

export function recordBehaviorSignal(
  userId: string,
  signalType: BehaviorSignalType,
  surfaceKey: string,
  source: BehaviorSignalSource,
  metadata?: BehaviorSignal['metadata'],
): void {
  try {
    const signal: BehaviorSignal = BehaviorSignalSchema.parse({
      userId,
      surfaceKey,
      signalType,
      source,
      timestamp: Date.now(),
      metadata,
    });

    const window = loadWindow(userId);
    window.signals.push(signal);
    window.signals = pruneOldSignals(window.signals);
    window.updatedAt = Date.now();
    saveWindow(userId, window);
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'behavior-signals',
      message: `Failed to record signal: ${signalType}`,
      level: 'warning',
    });
  }
}

export function getBehaviorSignals(
  userId: string,
  { maxAgeMs = WINDOW_MAX_AGE_MS, maxSignals = 20 } = {},
): BehaviorSignal[] {
  try {
    const window = loadWindow(userId);
    const cutoff = Date.now() - maxAgeMs;
    return window.signals
      .filter((s) => s.timestamp > cutoff)
      .slice(0, maxSignals);
  } catch {
    return [];
  }
}

export function clearBehaviorSignals(userId: string): void {
  try {
    getStorage().removeItem(getWindowKey(userId));
  } catch {
    // best effort
  }
}
