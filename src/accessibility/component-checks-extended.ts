/**
 * Component Accessibility Checks — Extended
 *
 * Additional component-level accessibility validation functions.
 */

import type {
  AuditableComponent,
  AuditAccessibilityIssue,
  ComponentAccessibilityConfig,
} from "./checks-types";
import { EXPECTED_ROLES } from "./checks-types";

export function checkMotionAccessibility(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  if (component.props?.animated && !component.props?.useNativeDriver) {
    issues.push({
      id: "animation-accessibility",
      type: "warning",
      category: "motion",
      severity: "moderate",
      message: "Animation may not respect reduced motion preferences",
      recommendation: "Use useNativeDriver and check reduced motion settings",
      element: config.componentName,
      wcagGuideline: "2.3.3",
      automated: true,
    });
  }
  return issues;
}

export function checkSemanticHTML(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  const expectedRole = EXPECTED_ROLES[config.componentName];
  if (
    expectedRole &&
    !expectedRole.includes(String(component.props?.accessibilityRole ?? ""))
  ) {
    issues.push({
      id: "incorrect-accessibility-role",
      type: "warning",
      category: "semantic",
      severity: "moderate",
      message: "Component may have incorrect accessibility role",
      recommendation: `Set accessibilityRole to one of: ${expectedRole.join(", ")}`,
      element: config.componentName,
      wcagGuideline: "4.1.2",
      automated: true,
    });
  }
  return issues;
}

export function checkTouchTargets(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  if (component.props?.style) {
    const style = component.props.style as Record<string, unknown>;
    const width = style.width as number | undefined;
    const height = style.height as number | undefined;
    const minHeight = style.minHeight as number | undefined;
    const minWidth = style.minWidth as number | undefined;
    const targetWidth = width || minWidth || 0;
    const targetHeight = height || minHeight || 0;
    if (targetWidth < 44 || targetHeight < 44) {
      issues.push({
        id: "small-touch-target",
        type: "warning",
        category: "touch",
        severity: "moderate",
        message: `Touch target may be too small: ${targetWidth}x${targetHeight} (minimum 44x44 recommended)`,
        recommendation: "Increase touch target size to at least 44x44 points",
        element: config.componentName,
        wcagGuideline: "2.5.5",
        automated: true,
      });
    }
  }
  return issues;
}
