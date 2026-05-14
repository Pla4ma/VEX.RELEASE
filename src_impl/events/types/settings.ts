/**
 * Settings Events
 */

export interface SettingsEventDefinitions {
  'settings:change': { key: string; value: unknown; previousValue?: unknown };
  'settings:reset': { category?: string };
}
