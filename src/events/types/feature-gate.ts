/**
 * Feature Gate Events
 */

export interface FeatureGateEventDefinitions {
  'feature-gate:access_attempted': {
    feature: string;
    accessMethod: string;
    context: Record<string, unknown>;
    timestamp: number;
  };
  'feature-gate:blocked': {
    feature: string;
    reason: string;
    fallbackRoute?: string;
    timestamp: number;
  };
  'feature-gate:allowed': {
    feature: string;
    accessMethod: string;
    timestamp: number;
  };
  'feature-gate:visibility_changed': {
    feature: string;
    wasVisible: boolean;
    isVisible: boolean;
    reason?: string;
    timestamp: number;
  };
}
