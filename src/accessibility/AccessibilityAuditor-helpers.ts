import type {
  AccessibilityAuditResult,
  AccessibilityIssue,
  AuditElement,
} from "./AccessibilityAuditor-types";

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
