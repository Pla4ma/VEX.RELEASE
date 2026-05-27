/**
 * Accessibility Check Types
 *
 * Re-exports types needed by check modules and shared check configuration.
 */

export type { AuditableComponent, AuditAccessibilityIssue, ComponentAccessibilityConfig } from './types';

export const EXPECTED_ROLES: Record<string, string[]> = {
  'Button': ['button'],
  'TextInput': ['textbox'],
  'Modal': ['dialog'],
  'FlatList': ['list'],
};
