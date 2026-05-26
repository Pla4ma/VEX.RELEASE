/**
 * Privacy Inventory
 *
 * Documents all data collected, stored, and transmitted by VEX.
 * Used for App Store privacy nutrition labels and internal compliance.
 */

export interface DataCategory {
  category: string;
  dataTypes: string[];
  purpose: string;
  linkedToUser: boolean;
  usedForTracking: boolean;
  storage: 'none' | 'device' | 'server' | 'both';
}

export const PRIVACY_INVENTORY: DataCategory[] = [
  {
    category: 'Identifiers',
    dataTypes: ['User ID', 'Device ID'],
    purpose: 'Account management and analytics',
    linkedToUser: true,
    usedForTracking: false,
    storage: 'server',
  },
  {
    category: 'Usage Data',
    dataTypes: [
      'Session duration',
      'Session grade',
      'Focus Score',
      'Streak count',
      'Lane recommendation',
    ],
    purpose: 'Core app functionality and adaptive lane recommendations',
    linkedToUser: true,
    usedForTracking: false,
    storage: 'both',
  },
  {
    category: 'Diagnostics',
    dataTypes: ['Crash logs', 'Performance metrics'],
    purpose: 'Bug fixing and performance monitoring via Sentry',
    linkedToUser: false,
    usedForTracking: false,
    storage: 'server',
  },
  {
    category: 'Purchases',
    dataTypes: ['Purchase history', 'Entitlement status'],
    purpose: 'Premium feature access via RevenueCat',
    linkedToUser: true,
    usedForTracking: false,
    storage: 'server',
  },
  {
    category: 'Contact Info',
    dataTypes: ['Email address'],
    purpose: 'Account authentication via Supabase Auth',
    linkedToUser: true,
    usedForTracking: false,
    storage: 'server',
  },
  {
    category: 'User Content',
    dataTypes: [
      'Display name',
      'Focus goal category',
      'Coach conversation history',
      'Memory entries',
    ],
    purpose: 'Personalization, coach interaction, and durable memory',
    linkedToUser: true,
    usedForTracking: false,
    storage: 'both',
  },
  {
    category: 'Notification Tokens',
    dataTypes: ['Push notification token'],
    purpose: 'Coach reminders, streak alerts, session nudges',
    linkedToUser: true,
    usedForTracking: false,
    storage: 'server',
  },
];

export function getDataCategories(): DataCategory[] {
  return PRIVACY_INVENTORY;
}

export function getPiiFields(): string[] {
  return ['Email address', 'Push notification token'];
}

export function getTrackingFields(): string[] {
  return [];
}
