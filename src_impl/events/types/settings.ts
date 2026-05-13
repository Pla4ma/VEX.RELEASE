/**
 * Settings Events
 */

export interface SettingsEventDefinitions {
  'settings:change': {
    key: string;
    value: unknown;
    previousValue?: unknown;
    category?: string;
  };
  'settings:reset': { category?: string };
}
