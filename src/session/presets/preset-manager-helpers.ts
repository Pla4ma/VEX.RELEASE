import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { SessionPreset } from '../types';
import { createDebugger } from '../../utils/debug';
import type { DEFAULT_PRESETS } from './default-presets';

const debug = createDebugger('session:presets');

export function initializeSystemPresetsData(
  presets: typeof DEFAULT_PRESETS,
): SessionPreset[] {
  const now = Date.now();
  return presets.map((preset) => ({
    ...preset,
    id: `system-${preset.name.toLowerCase().replace(/\s+/g, '-')}`,
    createdAt: now,
    updatedAt: now,
  }));
}

export function buildCustomPresetData(config: {
  name: string;
  duration: number;
  breakDuration?: number;
  intervals?: number;
  category?: string;
  strictMode?: boolean;
  dndEnabled?: boolean;
  description?: string;
}): Omit<SessionPreset, 'id' | 'createdAt' | 'updatedAt' | 'userId'> {
  return {
    name: config.name,
    description:
      config.description || `Custom ${config.duration} minute session`,
    duration: config.duration * 60,
    breakDuration: (config.breakDuration || 5) * 60,
    longBreakDuration: 15 * 60,
    intervals: config.intervals || 1,
    longBreakInterval: 4,
    isDefault: false,
    category: config.category || 'custom',
    tags: ['custom'],
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: config.dndEnabled ?? false,
    strictMode: config.strictMode ?? false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
  };
}

export async function loadUserPresetsFromStorage(
  userId: string,
): Promise<Map<string, SessionPreset>> {
  try {
    const key = `session:presets:${userId}`;
    const storage = getMMKVStorageAdapter();
    const data = await storage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data) as Record<string, SessionPreset>;
      const presets = new Map(Object.entries(parsed));
      debug.info('Loaded %d user presets', presets.size);
      return presets;
    }
  } catch (error) {
    debug.error('Failed to load user presets', error as Error);
  }
  return new Map();
}

export async function saveUserPresetsToStorage(
  userId: string,
  presets: Map<string, SessionPreset>,
): Promise<void> {
  try {
    const key = `session:presets:${userId}`;
    const data = Object.fromEntries(presets);
    const storage = getMMKVStorageAdapter();
    await storage.setItem(key, JSON.stringify(data));
  } catch (error) {
    debug.error('Failed to save user presets', error as Error);
  }
}
