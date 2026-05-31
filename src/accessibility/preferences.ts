/**
 * User accessibility preference management.
 */

import { eventBus } from '../events';
import type { AccessibilityPreferences } from './types';
import { DEFAULT_ACCESSIBILITY } from './types';

const userPreferences = new Map<string, AccessibilityPreferences>();

export function getAccessibilityPreferences(
  userId: string,
): AccessibilityPreferences {
  return userPreferences.get(userId) || { ...DEFAULT_ACCESSIBILITY };
}

export function updateAccessibilityPreferences(
  userId: string,
  updates: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  const current = getAccessibilityPreferences(userId);
  const updated = { ...current, ...updates };
  userPreferences.set(userId, updated);
  eventBus.publish('accessibility:preferences_changed', {
    userId,
    preferences: updated,
    changes: Object.keys(updates),
  });
  return updated;
}

export function detectSystemAccessibility(): Partial<AccessibilityPreferences> {
  return {
    screenReaderOptimized: false,
    reducedMotion: false,
    boldText: false,
  };
}
