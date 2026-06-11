/**
 * Screen Reader Support
 *
 * Screen reader announcements and utilities
 */

import { ScreenReaderAnnouncement } from './types';

const announcements: ScreenReaderAnnouncement[] = [];

/**
 * Announce message to screen readers
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): void {
  const announcement: ScreenReaderAnnouncement = {
    id: generateId(),
    message,
    priority,
    timestamp: Date.now(),
  };

  announcements.push(announcement);

  // Keep only last 50 announcements
  if (announcements.length > 50) {
    announcements.shift();
  }

  // Send to React Native
  if (priority === 'assertive') {
    // Use assertive region - would integrate with React Native AccessibilityInfo
    // AccessibilityInfo.announceForAccessibility(message);
  } else {
    // Use polite region - would integrate with React Native AccessibilityInfo
    // AccessibilityInfo.announceForAccessibility(message);
  }
}

/**
 * Get recent announcements
 */
export function getRecentAnnouncements(
  limit: number = 10,
): ScreenReaderAnnouncement[] {
  return announcements
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * Generate accessible label for an element
 */
export function generateAccessibleLabel(
  text: string,
  role?: string,
  state?: string,
  description?: string,
): string {
  const parts = [text];

  if (role) {
    parts.push(role);
  }

  if (state) {
    parts.push(state);
  }

  if (description) {
    parts.push(description);
  }

  return parts.join(', ');
}

/**
 * Clear old announcements
 */
export function clearOldAnnouncements(maxAge: number = 300000): void {
  // 5 minutes default
  const now = Date.now();
  const cutoff = now - maxAge;

  for (let i = announcements.length - 1; i >= 0; i--) {
    const a = announcements[i];
    if (a && a.timestamp < cutoff) {
      announcements.splice(i, 1);
    }
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
