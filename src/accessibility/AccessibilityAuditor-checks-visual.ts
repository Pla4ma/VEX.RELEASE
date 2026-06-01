import type {
  AccessibilityIssue,
  ComponentAccessibilityConfig,
  AuditElement,
} from './AccessibilityAuditor-types';
import { WCAG_GUIDELINES } from './AccessibilityAuditor-types';
import { checkContrast } from './AccessibilitySystem';
import { respectsReducedMotion, makeIssue } from './AccessibilityAuditor-helpers';

export function checkColorContrast(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  if (
    component.props?.style?.color &&
    component.props?.style?.backgroundColor
  ) {
    const contrast = checkContrast(
      component.props.style.color,
      component.props.style.backgroundColor,
    );
    if (!contrast.passesAA) {
      return [
        makeIssue(
          'insufficient-contrast',
          'error',
          'contrast',
          'critical',
          `Insufficient color contrast ratio: ${contrast.ratio.toFixed(2)} (minimum 4.5 required)`,
          'Increase color contrast to meet WCAG AA standards',
          WCAG_GUIDELINES['1.4.1']!,
          config.componentName,
        ),
      ];
    }
  }
  return [];
}

export function checkMotionAccessibility(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  if (component.props?.animated && !respectsReducedMotion(component)) {
    return [
      makeIssue(
        'motion-not-reduced',
        'warning',
        'motion',
        'moderate',
        'Animation does not respect reduced motion preference',
        'Use useReducedMotion hook to conditionally disable animations',
        WCAG_GUIDELINES['2.1.2']!,
        config.componentName,
      ),
    ];
  }
  return [];
}

export function checkSemanticHTML(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  if (
    config.componentName === 'Button' &&
    !component.props?.accessibilityRole
  ) {
    return [
      makeIssue(
        'no-semantic-role',
        'warning',
        'semantic',
        'moderate',
        'Button should have explicit semantic role',
        'Add accessibilityRole="button" to reinforce semantic meaning',
        WCAG_GUIDELINES['4.1.2']!,
        config.componentName,
      ),
    ];
  }
  return [];
}

export function checkTouchTargets(
  component: AuditElement,
  config: ComponentAccessibilityConfig,
): AccessibilityIssue[] {
  if (component.props?.style?.width && component.props?.style?.height) {
    const width = Number(component.props.style.width);
    const height = Number(component.props.style.height);
    if (width < 44 || height < 44) {
      return [
        makeIssue(
          'touch-target-too-small',
          'error',
          'touch',
          'major',
          `Touch target too small: ${width}x${height}px (minimum 44x44px required)`,
          'Increase touch target size to meet accessibility guidelines',
          WCAG_GUIDELINES['2.5.1']!,
          config.componentName,
        ),
      ];
    }
  }
  return [];
}
