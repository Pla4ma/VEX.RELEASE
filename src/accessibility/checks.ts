/**
 * Accessibility Checks
 *
 * Screen-level accessibility validation functions.
 * Component-level checks live in component-checks.ts.
 */

import type { AuditableComponent, AuditAccessibilityIssue } from './checks-types';
import { runComponentChecks } from './component-checks';

export { runComponentChecks } from './component-checks';
export type { AuditableComponent, AuditAccessibilityIssue, ComponentAccessibilityConfig } from './checks-types';

function checkScreenStructure(screenElement: AuditableComponent): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  if (!screenElement.props?.accessibilityLabel) {
    issues.push({
      id: 'missing-page-title',
      type: 'error',
      category: 'screen-reader',
      severity: 'major',
      message: 'Screen missing accessibility label/title',
      recommendation: 'Add accessibilityLabel to describe screen purpose',
      element: 'Screen',
      wcagGuideline: '2.4.2',
      automated: true,
    });
  }
  return issues;
}

function checkNavigationOrder(): AuditAccessibilityIssue[] {
  return [{
    id: 'navigation-order-check',
    type: 'info',
    category: 'focus',
    severity: 'minor',
    message: 'Navigation order should be manually verified',
    recommendation: 'Test keyboard navigation to ensure logical focus order',
    element: 'Screen',
    wcagGuideline: '2.4.3',
    automated: false,
  }];
}

export function runScreenChecks(screenElement: AuditableComponent): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  issues.push(...checkScreenStructure(screenElement));
  issues.push(...checkNavigationOrder());
  return issues;
}
