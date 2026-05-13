/**
 * Notifications Feature Events
 *
 * Event definitions for notification management, delivery, and user preferences.
 */

import { NotificationEvent } from './types';

// Base Event Interface
// Notification Lifecycle Events
// Template Events
// Preference Events
// Campaign Events
// Rule Events
// Analytics Events
// Webhook Events
// System Events
// User Interaction Events
// Union Type for All Notification Events
// Event Factory Functions
// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

// Event Validation

function validateNotificationSentEvent(event: NotificationSentEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.type && data.category && data.priority && data.channels && data.template && data.personalization);
}

function validateNotificationDeliveredEvent(event: NotificationDeliveredEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.channel && data.deliveryTime && typeof data.latency === 'number' && data.provider);
}

function validateNotificationReadEvent(event: NotificationReadEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.readAt && typeof data.readTimeframe === 'number' && data.readMethod && data.readContext);
}

function validateNotificationClickedEvent(event: NotificationClickedEvent): boolean {
  const { data } = event;
  return !!(data.notificationId && data.clickedAt && typeof data.clickTimeframe === 'number' && data.action && data.clickContext);
}

// Event Serialization
export * from "./events.types";
export * from "./events.part1";
