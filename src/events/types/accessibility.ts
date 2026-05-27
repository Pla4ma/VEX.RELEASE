/**
 * Accessibility Events
 */

export interface AccessibilityEventDefinitions {
  "accessibility:announce": {
    message: string;
    priority?: "low" | "normal" | "high";
  };
  "accessibility:preferences_changed": {
    userId: string;
    preferences: Record<string, unknown>;
    changes: string[];
  };
}
