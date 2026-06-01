import type { AccessibilityAudit } from './types';

export function auditScreen(screenId: string): AccessibilityAudit {
  return {
    screenId,
    timestamp: Date.now(),
    issues: [],
    score: 100,
  };
}
