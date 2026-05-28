import type {
  AccessibilityAuditResult,
  AccessibilityIssue,
  AuditElement,
} from "./AccessibilityAuditor-types";
import { WCAG_GUIDELINES } from "./AccessibilityAuditor-types";

export function makeIssue(
  id: string,
  type: AccessibilityIssue["type"],
  category: AccessibilityIssue["category"],
  severity: AccessibilityIssue["severity"],
  message: string,
  recommendation: string,
  wcagGuideline: string,
  element?: string,
  automated: boolean = true,
): AccessibilityIssue {
  return {
    id,
    type,
    category,
    severity,
    message,
    recommendation,
    element,
    wcagGuideline,
    automated,
  };
}
export function canReceiveFocus(component: AuditElement): boolean {
  return !!(
    component.props?.accessible !== false &&
    (component.props?.tabIndex !== -1 ||
      component.props?.tabIndex === undefined)
  );
}
export function respectsReducedMotion(_component: AuditElement): boolean {
  return true;
}
export function findElementsByRole(
  _element: AuditElement,
  _role: string,
): AuditElement[] {
  return [];
}
export function findFocusableElements(_element: AuditElement): AuditElement[] {
  return [];
}
export function hasLogicalTabOrder(_elements: AuditElement[]): boolean {
  return true;
}
export function hasLogicalHeadingOrder(_headings: AuditElement[]): boolean {
  return true;
}
export function findDynamicElements(_element: AuditElement): AuditElement[] {
  return [];
}
export function hasAriaLiveRegion(element: AuditElement): boolean {
  return !!element.props?.accessibilityLiveRegion;
}
export function findAnimatedElements(_element: AuditElement): AuditElement[] {
  return [];
}
export function findColorOnlyElements(_element: AuditElement): AuditElement[] {
  return [];
}
export function createAuditResult(
  issues: AccessibilityIssue[],
  passedChecks: string[],
  failedChecks: string[],
): AccessibilityAuditResult {
  const summary = {
    critical: issues.filter((i) => i.severity === "critical").length,
    major: issues.filter((i) => i.severity === "major").length,
    moderate: issues.filter((i) => i.severity === "moderate").length,
    minor: issues.filter((i) => i.severity === "minor").length,
  };
  const criticalWeight = 10;
  const majorWeight = 5;
  const moderateWeight = 2;
  const minorWeight = 1;
  const weightedIssues =
    summary.critical * criticalWeight +
    summary.major * majorWeight +
    summary.moderate * moderateWeight +
    summary.minor * minorWeight;
  const maxPossibleScore = 100;
  const score = Math.max(0, maxPossibleScore - weightedIssues);
  return {
    score,
    issues,
    passedChecks,
    failedChecks,
    summary,
    timestamp: Date.now(),
  };
}
export function createPassingResult(
  _reason: string,
): AccessibilityAuditResult {
  return {
    score: 100,
    issues: [],
    passedChecks: ["no-audit-required"],
    failedChecks: [],
    summary: { critical: 0, major: 0, moderate: 0, minor: 0 },
    timestamp: Date.now(),
  };
}
export function getComponentDisplayName(
  component: AuditElement,
): string | undefined {
  if (typeof component.type === "string") return component.type;
  return component.type?.displayName;
}
export function getElementName(element: AuditElement): string | undefined {
  if (typeof element.type === "string") return element.type;
  return element.type?.displayName;
}
export function checkScreenStructure(
  screenElement: AuditElement,
): AccessibilityIssue[] {
  const headings = findElementsByRole(screenElement, "heading");
  if (headings.length > 0 && !hasLogicalHeadingOrder(headings)) {
    return [
      makeIssue(
        "invalid-heading-structure",
        "error",
        "semantic",
        "major",
        "Screen has invalid heading hierarchy",
        "Ensure headings follow logical order (h1, h2, h3, etc.)",
        WCAG_GUIDELINES["1.3.1"]!,
        undefined,
        false,
      ),
    ];
  }
  return [];
}
export function checkNavigationOrder(
  screenElement: AuditElement,
): AccessibilityIssue[] {
  const focusableElements = findFocusableElements(screenElement);
  if (
    focusableElements.length > 0 &&
    !hasLogicalTabOrder(focusableElements)
  ) {
    return [
      makeIssue(
        "invalid-tab-order",
        "error",
        "keyboard",
        "major",
        "Screen has illogical navigation order",
        "Ensure focusable elements follow logical reading order",
        WCAG_GUIDELINES["2.4.1"]!,
        undefined,
        false,
      ),
    ];
  }
  return [];
}
export function checkScreenReaderAnnouncements(
  screenElement: AuditElement,
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const dynamicElements = findDynamicElements(screenElement);
  dynamicElements.forEach((element) => {
    if (!hasAriaLiveRegion(element)) {
      issues.push(
        makeIssue(
          "missing-aria-live",
          "warning",
          "screen-reader",
          "moderate",
          "Dynamic content changes are not announced to screen readers",
          "Add aria-live or accessibilityLiveRegion to dynamic content areas",
          WCAG_GUIDELINES["4.1.3"]!,
          getElementName(element),
        ),
      );
    }
  });
  return issues;
}
export function checkMotionPreferences(
  screenElement: AuditElement,
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const animatedElements = findAnimatedElements(screenElement);
  animatedElements.forEach((element) => {
    if (!respectsReducedMotion(element)) {
      issues.push(
        makeIssue(
          "animation-not-reduced",
          "warning",
          "motion",
          "moderate",
          "Animation does not respect reduced motion preference",
          "Use useReducedMotion hook to conditionally disable animations",
          WCAG_GUIDELINES["2.1.2"]!,
          getElementName(element),
        ),
      );
    }
  });
  return issues;
}
export function checkColorBlindSupport(
  screenElement: AuditElement,
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const colorOnlyElements = findColorOnlyElements(screenElement);
  colorOnlyElements.forEach((element) => {
    issues.push(
      makeIssue(
        "color-only-information",
        "error",
        "color",
        "critical",
        "Information conveyed only through color",
        "Add text, patterns, or icons to convey information without relying on color",
        WCAG_GUIDELINES["1.4.1"]!,
        getElementName(element),
      ),
    );
  });
  return issues;
}
