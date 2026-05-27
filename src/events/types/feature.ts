/**
 * Feature Flag Events
 */

export interface FeatureEventDefinitions {
  "feature:flag:update": { flag: string; enabled: boolean };
  "feature:flags:sync": { flags: Record<string, boolean> };
  "feature:updated": {
    key: string;
    oldValue: unknown;
    newValue: unknown;
    flag?: unknown;
    timestamp?: number;
  };
  "feature:override": { key: string; value: unknown; timestamp?: number };
  "feature:registered": { key: string; flag: unknown; timestamp?: number };
  "feature:fetch_failed": { error: string; timestamp: number };
}
