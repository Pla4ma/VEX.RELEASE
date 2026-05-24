/**
 * App Lifecycle Events
 */

export interface AppEventDefinitions {
  'app:foreground': { timestamp: number };
  'app:background': { timestamp: number };
  'app:inactive': { timestamp: number };
  'app:day_changed': { timestamp: number };
}
