/**
 * Component Accessibility Checks
 *
 * Component-level accessibility validation functions.
 */

import type {
  AuditableComponent,
  AuditAccessibilityIssue,
  ComponentAccessibilityConfig,
} from "./checks-types";
import { EXPECTED_ROLES } from "./checks-types";
import { checkContrast } from "./AccessibilitySystem";

function checkAccessibilityLabels(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  if (!config.requiredLabels) {
    return issues;
  }

  for (const requiredLabel of config.requiredLabels) {
    if (!component.props || component.props[requiredLabel] === undefined) {
      issues.push({
        id: `missing-${requiredLabel}`,
        type: "error",
        category: "screen-reader",
        severity: "critical",
        message: `Missing required accessibility property: ${requiredLabel}`,
        recommendation: `Add ${requiredLabel} prop to provide context for screen readers`,
        element: config.componentName,
        wcagGuideline: "1.1.1",
        automated: true,
      });
    }
  }
  return issues;
}

function checkFocusManagement(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  if (config.interactiveElements && config.interactiveElements.length > 0) {
    if (component.props?.accessible === false) {
      issues.push({
        id: "focusable-not-accessible",
        type: "error",
        category: "focus",
        severity: "major",
        message: "Interactive component is marked as not accessible",
        recommendation:
          "Remove accessible={false} or make component non-interactive",
        element: config.componentName,
        wcagGuideline: "2.1.1",
        automated: true,
      });
    }
  }
  return issues;
}

function checkKeyboardNavigation(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  if (
    config.interactiveElements?.includes("button") &&
    !component.props?.onPress
  ) {
    issues.push({
      id: "no-keyboard-handler",
      type: "warning",
      category: "keyboard",
      severity: "moderate",
      message: "Button may not be keyboard accessible",
      recommendation: "Ensure button can be activated with keyboard/Enter key",
      element: config.componentName,
      wcagGuideline: "2.1.1",
      automated: true,
    });
  }
  return issues;
}

function checkColorContrast(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  const style = component.props?.style;
  if (style && (style as Record<string, unknown>).color && (style as Record<string, unknown>).backgroundColor) {
    const s = style as Record<string, unknown>;
    const contrast = checkContrast(String(s.color), String(s.backgroundColor));
    if (!contrast.passesAA) {
      issues.push({
        id: "poor-contrast",
        type: "error",
        category: "contrast",
        severity: "critical",
        message: `Poor color contrast: ${contrast.ratio.toFixed(2)} (minimum 4.5 required)`,
        recommendation: "Increase color contrast to meet WCAG AA standards",
        element: config.componentName,
        wcagGuideline: "1.4.3",
        automated: true,
      });
    }
  }
  return issues;
}

function checkMotionAccessibility(
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

function checkSemanticHTML(
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

function checkTouchTargets(
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

export function runComponentChecks(
  component: AuditableComponent,
  config: ComponentAccessibilityConfig,
): AuditAccessibilityIssue[] {
  const issues: AuditAccessibilityIssue[] = [];
  issues.push(...checkAccessibilityLabels(component, config));
  issues.push(...checkFocusManagement(component, config));
  issues.push(...checkKeyboardNavigation(component, config));
  issues.push(...checkColorContrast(component, config));
  issues.push(...checkMotionAccessibility(component, config));
  issues.push(...checkSemanticHTML(component, config));
  issues.push(...checkTouchTargets(component, config));
  return issues;
}
