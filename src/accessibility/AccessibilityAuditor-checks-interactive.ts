import type {
  AccessibilityIssue,
  ComponentAccessibilityConfig,
  AuditElement,
} from "./AccessibilityAuditor-types";
import { WCAG_GUIDELINES } from "./AccessibilityAuditor-types";
import { canReceiveFocus, makeIssue } from "./AccessibilityAuditor-helpers";

export function checkAccessibilityLabels(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  if (
    !component.props?.accessibilityLabel &&
    config.requiredLabels?.includes("accessibilityLabel")
  ) {
    issues.push(
      makeIssue(
        "missing-accessibility-label",
        "error",
        "screen-reader",
        "critical",
        "Interactive element missing accessibility label",
        "Add accessibilityLabel prop to describe the element's purpose",
        WCAG_GUIDELINES["4.1.2"]!,
        config.componentName,
      ),
    );
  }
  if (
    !component.props?.accessibilityRole &&
    config.requiredLabels?.includes("accessibilityRole")
  ) {
    issues.push(
      makeIssue(
        "missing-accessibility-role",
        "error",
        "semantic",
        "major",
        "Element missing accessibility role",
        "Add accessibilityRole prop to define the element's purpose",
        WCAG_GUIDELINES["4.1.2"]!,
        config.componentName,
      ),
    );
  }
  if (
    component.props?.accessibilityLabel &&
    !component.props?.accessibilityHint
  ) {
    issues.push(
      makeIssue(
        "missing-accessibility-hint",
        "warning",
        "screen-reader",
        "moderate",
        "Interactive element could benefit from accessibility hint",
        "Add accessibilityHint to explain the result of interaction",
        WCAG_GUIDELINES["2.5.1"]!,
        config.componentName,
      ),
    );
  }
  return issues;
}

export function checkFocusManagement(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  if (
    config.interactiveElements &&
    config.interactiveElements.length > 0 &&
    !canReceiveFocus(component)
  ) {
    return [
      makeIssue(
        "focus-not-receivable",
        "error",
        "focus",
        "critical",
        "Interactive element cannot receive focus",
        "Ensure the component is focusable using tabIndex or native focus handling",
        WCAG_GUIDELINES["2.1.1"]!,
        config.componentName,
      ),
    ];
  }
  return [];
}

export function checkKeyboardNavigation(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  if (
    config.interactiveElements?.includes("button") &&
    !component.props?.onPress &&
    !component.props?.onKeyDown
  ) {
    return [
      makeIssue(
        "no-keyboard-support",
        "error",
        "keyboard",
        "critical",
        "Interactive element lacks keyboard support",
        "Add keyboard event handlers or ensure component supports keyboard navigation",
        WCAG_GUIDELINES["2.1.1"]!,
        config.componentName,
      ),
    ];
  }
  return [];
}
