import type {
  AccessibilityIssue,
  AuditElement,
} from './AccessibilityAuditor-types';
import { WCAG_GUIDELINES } from './AccessibilityAuditor-types';
import {
  findElementsByRole,
  findFocusableElements,
  hasLogicalTabOrder,
  hasLogicalHeadingOrder,
  findDynamicElements,
  hasAriaLiveRegion,
  findAnimatedElements,
  respectsReducedMotion,
  findColorOnlyElements,
  makeIssue,
  getElementName,
} from './AccessibilityAuditor-helpers';

export function checkScreenStructure(
  screenElement: AuditElement,
): AccessibilityIssue[] {
  const headings = findElementsByRole(screenElement, 'heading');
  if (headings.length > 0 && !hasLogicalHeadingOrder(headings)) {
    return [
      makeIssue(
        'invalid-heading-structure',
        'error',
        'semantic',
        'major',
        'Screen has invalid heading hierarchy',
        'Ensure headings follow logical order (h1, h2, h3, etc.)',
        WCAG_GUIDELINES['1.3.1']!,
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
        'invalid-tab-order',
        'error',
        'keyboard',
        'major',
        'Screen has illogical navigation order',
        'Ensure focusable elements follow logical reading order',
        WCAG_GUIDELINES['2.4.1']!,
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
          'missing-aria-live',
          'warning',
          'screen-reader',
          'moderate',
          'Dynamic content changes are not announced to screen readers',
          'Add aria-live or accessibilityLiveRegion to dynamic content areas',
          WCAG_GUIDELINES['4.1.3']!,
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
          'animation-not-reduced',
          'warning',
          'motion',
          'moderate',
          'Animation does not respect reduced motion preference',
          'Use useReducedMotion hook to conditionally disable animations',
          WCAG_GUIDELINES['2.1.2']!,
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
        'color-only-information',
        'error',
        'color',
        'critical',
        'Information conveyed only through color',
        'Add text, patterns, or icons to convey information without relying on color',
        WCAG_GUIDELINES['1.4.1']!,
        getElementName(element),
      ),
    );
  });
  return issues;
}
