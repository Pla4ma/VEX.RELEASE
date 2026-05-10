/**
 * Accessibility Auditor
 *
 * Comprehensive accessibility audit system for WCAG 2.1 AA compliance:
 * - Component-level accessibility checks
 * - Screen-level accessibility validation
 * - Motion and animation accessibility
 * - Color contrast validation
 * - Screen reader optimization
 * - Keyboard navigation support
 */

import { createDebugger } from '../utils/debug';
<<<<<<< HEAD
import {
  checkContrast,
} from './AccessibilitySystem';
=======
import { checkContrast } from './AccessibilitySystem';
import type { AuditableComponent } from './types';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

const debug = createDebugger('accessibility-auditor');

type AuditableProps = {
  props?: {
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    animated?: boolean;
    useNativeDriver?: boolean;
    onPress?: unknown;
    onLongPress?: unknown;
    children?: unknown;
    style?: {
      color?: string;
      backgroundColor?: string;
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
    };
    [key: string]: unknown;
  };
  type?: {
    displayName?: string;
  };
};

function isAuditableElement(value: unknown): value is AuditableProps {
  return typeof value === 'object' && value !== null;
}

function getAuditableElement(value: unknown): AuditableProps {
  return isAuditableElement(value) ? value : {};
}

// ============================================================================
// Accessibility Audit Types
// ============================================================================

export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'focus' | 'keyboard' | 'screen-reader' | 'motion' | 'color' | 'semantic' | 'touch';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  message: string;
  recommendation: string;
  element?: string;
  wcagGuideline: string;
  automated: boolean; // Can be automatically detected
}

export interface AccessibilityAuditResult {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  passedChecks: string[];
  failedChecks: string[];
  summary: {
    critical: number;
    major: number;
    moderate: number;
    minor: number;
  };
  timestamp: number;
}

export interface ComponentAccessibilityConfig {
  /** Component name for identification */
  componentName: string;
  /** Whether component requires accessibility testing */
  requiresTesting: boolean;
  /** Custom accessibility rules for this component */
  customRules?: AccessibilityRule[];
  /** Expected interactive elements */
  interactiveElements?: string[];
  /** Required accessibility labels */
  requiredLabels?: string[];
}

export interface AccessibilityRule {
  id: string;
  description: string;
  check: (element: AuditableComponent) => AccessibilityIssue | null;
  category: AccessibilityIssue['category'];
  severity: AccessibilityIssue['severity'];
  wcagGuideline: string;
}

// ============================================================================
// WCAG 2.1 AA Guidelines Reference
// ============================================================================

<<<<<<< HEAD
export const WCAG_GUIDELINES = {
=======
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WCAG_GUIDELINES = {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
  '1.1.1': 'Non-text Content: All non-text content has a text alternative',
  '1.2.1': 'Audio-only and Video-only: Prerecorded content has alternatives',
  '1.3.1': 'Adaptable: Create content that can be presented in different ways',
  '1.4.1': 'Distinguishable: Make it easier to see and hear content',
  '2.1.1': 'Keyboard Accessible: Make all functionality available from a keyboard',
  '2.1.2': 'No Keyboard Trap: Keyboard focus should not be trapped',
  '2.2.1': 'Adjustable: Do not use content that causes seizures',
  '2.3.1': 'Navigation from any location: Help users navigate and find content',
  '2.4.1': 'Orientation: Content does not restrict its view to a single orientation',
  '2.5.1': 'Input Modalities: Make functionality available from various input devices',
  '3.1.1': 'Info and Relationships: Info, structure, and relationships can be programmatically determined',
  '3.2.1': 'Focus Visible: Any component receiving focus must be visible',
  '3.2.2': 'Focus Order: Focus order must be logical',
  '3.2.3': 'Input Assistance: Help users avoid and correct mistakes',
  '3.2.4': 'Status Messages: Status messages can be programmatically determined',
  '3.3.1': 'Error Identification: Error messages clearly identify errors',
  '3.3.2': 'Labels or Instructions: Labels or instructions are provided',
  '4.1.1': 'Parsing: Content is structured so it can be parsed by assistive technologies',
  '4.1.2': 'Name, Role, Value: Components have name, role, and value',
  '4.1.3': 'Status Properties: States can be programmatically determined',
} as const;

// ============================================================================
// Accessibility Auditor Class
// ============================================================================

export class AccessibilityAuditor {
  private auditHistory: AccessibilityAuditResult[] = [];
  private componentConfigs: Map<string, ComponentAccessibilityConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  // ============================================================================
  // Component Configuration Management
  // ============================================================================

  private initializeDefaultConfigs(): void {
    const defaultConfigs: ComponentAccessibilityConfig[] = [
      {
        componentName: 'Button',
        requiresTesting: true,
        interactiveElements: ['button'],
        requiredLabels: ['accessibilityLabel'],
      },
      {
        componentName: 'TextInput',
        requiresTesting: true,
        interactiveElements: ['input', 'textarea'],
        requiredLabels: ['accessibilityLabel', 'accessibilityPlaceholder'],
      },
      {
        componentName: 'TouchableOpacity',
        requiresTesting: true,
        interactiveElements: ['button', 'link'],
        requiredLabels: ['accessibilityLabel'],
      },
      {
        componentName: 'Modal',
        requiresTesting: true,
        interactiveElements: ['dialog'],
        requiredLabels: ['accessibilityLabel', 'accessibilityRole'],
      },
      {
        componentName: 'FlatList',
        requiresTesting: true,
        interactiveElements: ['list', 'listitem'],
        requiredLabels: ['accessibilityLabel'],
      },
      {
        componentName: 'TabBar',
        requiresTesting: true,
        interactiveElements: ['tab'],
        requiredLabels: ['accessibilityLabel'],
      },
    ];

    defaultConfigs.forEach(config => {
      this.componentConfigs.set(config.componentName, config);
    });
  }

  registerComponentConfig(config: ComponentAccessibilityConfig): void {
    this.componentConfigs.set(config.componentName, config);
    debug.info(`Registered accessibility config for component: ${config.componentName}`);
  }

  // ============================================================================
  // Main Audit Methods
  // ============================================================================

<<<<<<< HEAD
  async auditComponent(component: unknown, config?: ComponentAccessibilityConfig): Promise<AccessibilityAuditResult> {
    const auditableComponent = getAuditableElement(component);
    const componentConfig = config || this.componentConfigs.get(auditableComponent.type?.displayName || '') || {
=======
  async auditComponent(component: AuditableComponent, config?: ComponentAccessibilityConfig): Promise<AccessibilityAuditResult> {
    const displayName = typeof component.type === 'object' ? component.type?.displayName : undefined;
    const componentConfig = config || (displayName ? this.componentConfigs.get(displayName) : undefined) || {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
      componentName: 'Unknown',
      requiresTesting: false,
    };

    if (!componentConfig.requiresTesting) {
      return this.createPassingResult('Component does not require accessibility testing');
    }

    debug.info(`Auditing component: ${componentConfig.componentName}`);

    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    // Run all accessibility checks
    issues.push(...this.checkAccessibilityLabels(auditableComponent, componentConfig));
    issues.push(...this.checkFocusManagement(auditableComponent, componentConfig));
    issues.push(...this.checkKeyboardNavigation(auditableComponent, componentConfig));
    issues.push(...this.checkColorContrast(auditableComponent, componentConfig));
    issues.push(...this.checkMotionAccessibility(auditableComponent, componentConfig));
    issues.push(...this.checkSemanticHTML(auditableComponent, componentConfig));
    issues.push(...this.checkTouchTargets(auditableComponent, componentConfig));

    // Categorize issues
    issues.forEach(issue => {
      if (issue.type === 'error') {
        failedChecks.push(issue.id);
      } else {
        passedChecks.push(issue.id);
      }
    });

    return this.createAuditResult(issues, passedChecks, failedChecks);
  }

  async auditScreen(screenName: string, screenElement: AuditableComponent): Promise<AccessibilityAuditResult> {
    debug.info(`Auditing screen: ${screenName}`);

    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    // Screen-level checks
    issues.push(...this.checkScreenStructure(screenElement));
    issues.push(...this.checkNavigationOrder(screenElement));
    issues.push(...this.checkScreenReaderAnnouncements(screenElement));
    issues.push(...this.checkReducedMotion(screenElement));

    // Component-level checks for all interactive elements
    const interactiveElements = this.findInteractiveElements(screenElement);
    for (const element of interactiveElements) {
      const componentResult = await this.auditComponent(element);
      issues.push(...componentResult.issues);
      passedChecks.push(...componentResult.passedChecks);
      failedChecks.push(...componentResult.failedChecks);
    }

    return this.createAuditResult(issues, passedChecks, failedChecks);
  }

  // ============================================================================
  // Specific Accessibility Checks
  // ============================================================================

<<<<<<< HEAD
  private checkAccessibilityLabels(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkAccessibilityLabels(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    if (!config.requiredLabels) {return issues;}

    for (const requiredLabel of config.requiredLabels) {
      if (!component.props || component.props[requiredLabel] === undefined) {
        issues.push({
          id: `missing-${requiredLabel}`,
          type: 'error',
          category: 'screen-reader',
          severity: 'critical',
          message: `Missing required accessibility property: ${requiredLabel}`,
          recommendation: `Add ${requiredLabel} prop to provide context for screen readers`,
          element: config.componentName,
          wcagGuideline: '1.1.1',
          automated: true,
        });
      }
    }

    return issues;
  }

<<<<<<< HEAD
  private checkFocusManagement(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkFocusManagement(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check if component is focusable when it should be
    if (config.interactiveElements && config.interactiveElements.length > 0) {
      if (component.props?.accessible === false) {
        issues.push({
          id: 'focusable-not-accessible',
          type: 'error',
          category: 'focus',
          severity: 'major',
          message: 'Interactive component is marked as not accessible',
          recommendation: 'Remove accessible={false} or make component non-interactive',
          element: config.componentName,
          wcagGuideline: '2.1.1',
          automated: true,
        });
      }
    }

    return issues;
  }

<<<<<<< HEAD
  private checkKeyboardNavigation(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkKeyboardNavigation(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check for keyboard navigation support
    if (config.interactiveElements?.includes('button') && !component.props?.onPress) {
      issues.push({
        id: 'no-keyboard-handler',
        type: 'warning',
        category: 'keyboard',
        severity: 'moderate',
        message: 'Button may not be keyboard accessible',
        recommendation: 'Ensure button can be activated with keyboard/Enter key',
        element: config.componentName,
        wcagGuideline: '2.1.1',
        automated: true,
      });
    }

    return issues;
  }

<<<<<<< HEAD
  private checkColorContrast(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkColorContrast(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    const style = component.props?.style;
    if (style && style.color && style.backgroundColor) {
      const contrast = checkContrast(style.color, style.backgroundColor);

      if (!contrast.passesAA) {
        issues.push({
          id: 'poor-contrast',
          type: 'error',
          category: 'contrast',
          severity: 'critical',
          message: `Poor color contrast: ${contrast.ratio.toFixed(2)} (minimum 4.5 required)`,
          recommendation: 'Increase color contrast to meet WCAG AA standards',
          element: config.componentName,
          wcagGuideline: '1.4.3',
          automated: true,
        });
      }
    }

    return issues;
  }

<<<<<<< HEAD
  private checkMotionAccessibility(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkMotionAccessibility(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check for animations that should respect reduced motion
    if (component.props?.animated && !component.props?.useNativeDriver) {
      issues.push({
        id: 'animation-accessibility',
        type: 'warning',
        category: 'motion',
        severity: 'moderate',
        message: 'Animation may not respect reduced motion preferences',
        recommendation: 'Use useNativeDriver and check reduced motion settings',
        element: config.componentName,
        wcagGuideline: '2.3.3',
        automated: true,
      });
    }

    return issues;
  }

<<<<<<< HEAD
  private checkSemanticHTML(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkSemanticHTML(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check for proper accessibility roles
    const expectedRoles: Record<string, string[]> = {
      'Button': ['button'],
      'TextInput': ['textbox'],
      'Modal': ['dialog'],
      'FlatList': ['list'],
    };

    const expectedRole = expectedRoles[config.componentName];
    if (expectedRole && !expectedRole.includes(component.props?.accessibilityRole || '')) {
      issues.push({
        id: 'incorrect-accessibility-role',
        type: 'warning',
        category: 'semantic',
        severity: 'moderate',
        message: 'Component may have incorrect accessibility role',
        recommendation: `Set accessibilityRole to one of: ${expectedRole.join(', ')}`,
        element: config.componentName,
        wcagGuideline: '4.1.2',
        automated: true,
      });
    }

    return issues;
  }

<<<<<<< HEAD
  private checkTouchTargets(component: AuditableProps, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
=======
  private checkTouchTargets(component: AuditableComponent, config: ComponentAccessibilityConfig): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check minimum touch target size (44x44pt recommended)
    if (component.props?.style) {
      const { width, height, minHeight, minWidth } = component.props.style;
      const targetWidth = width || minWidth || 0;
      const targetHeight = height || minHeight || 0;

      if (targetWidth < 44 || targetHeight < 44) {
        issues.push({
          id: 'small-touch-target',
          type: 'warning',
          category: 'touch',
          severity: 'moderate',
          message: `Touch target may be too small: ${targetWidth}x${targetHeight} (minimum 44x44 recommended)`,
          recommendation: 'Increase touch target size to at least 44x44 points',
          element: config.componentName,
          wcagGuideline: '2.5.5',
          automated: true,
        });
      }
    }

    return issues;
  }

  // ============================================================================
  // Screen-Level Checks
  // ============================================================================

  private checkScreenStructure(screenElement: AuditableComponent): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const element = getAuditableElement(screenElement);

    // Check for page title
    if (!element.props?.accessibilityLabel) {
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

<<<<<<< HEAD
  private checkNavigationOrder(_screenElement: unknown): AccessibilityIssue[] {
=======
  private checkNavigationOrder(_screenElement: AuditableComponent): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // This would require analyzing the actual focus order
    // For now, just a placeholder
    issues.push({
      id: 'navigation-order-check',
      type: 'info',
      category: 'focus',
      severity: 'minor',
      message: 'Navigation order should be manually verified',
      recommendation: 'Test keyboard navigation to ensure logical focus order',
      element: 'Screen',
      wcagGuideline: '2.4.3',
      automated: false,
    });

    return issues;
  }

<<<<<<< HEAD
  private checkScreenReaderAnnouncements(_screenElement: unknown): AccessibilityIssue[] {
=======
  private checkScreenReaderAnnouncements(_screenElement: AuditableComponent): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check for dynamic content that should announce changes
    // This is a placeholder for more complex logic
    return issues;
  }

<<<<<<< HEAD
  private checkReducedMotion(_screenElement: unknown): AccessibilityIssue[] {
=======
  private checkReducedMotion(_screenElement: AuditableComponent): AccessibilityIssue[] {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    const issues: AccessibilityIssue[] = [];

    // Check if animations respect reduced motion preferences
    // This would require checking for prefers-reduced-motion
    return issues;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

<<<<<<< HEAD
  private findInteractiveElements(element: unknown): unknown[] {
    const interactive: unknown[] = [];
    const auditableElement = getAuditableElement(element);
=======
  private findInteractiveElements(element: AuditableComponent): AuditableComponent[] {
    const interactive: AuditableComponent[] = [];
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

    // Recursively find interactive elements
    // This is a simplified implementation
    if (auditableElement.props?.onPress || auditableElement.props?.onLongPress ||
        auditableElement.props?.accessibilityRole === 'button' ||
        auditableElement.props?.accessibilityRole === 'link') {
      interactive.push(element);
    }

    // Check children (simplified)
    if (auditableElement.props?.children) {
      // In a real implementation, this would handle React.Children properly
    }

    return interactive;
  }

  private createAuditResult(
    issues: AccessibilityIssue[],
    passedChecks: string[],
    failedChecks: string[]
  ): AccessibilityAuditResult {
    // Calculate score based on issue severity
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'moderate':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    score = Math.max(0, score);

    // Count issues by severity
    const summary = {
      critical: issues.filter(i => i.severity === 'critical').length,
      major: issues.filter(i => i.severity === 'major').length,
      moderate: issues.filter(i => i.severity === 'moderate').length,
      minor: issues.filter(i => i.severity === 'minor').length,
    };

    return {
      score,
      issues,
      passedChecks,
      failedChecks,
      summary,
      timestamp: Date.now(),
    };
  }

  private createPassingResult(_message: string): AccessibilityAuditResult {
    return {
      score: 100,
      issues: [],
      passedChecks: ['no-audit-required'],
      failedChecks: [],
      summary: {
        critical: 0,
        major: 0,
        moderate: 0,
        minor: 0,
      },
      timestamp: Date.now(),
    };
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  getAuditHistory(): AccessibilityAuditResult[] {
    return [...this.auditHistory];
  }

  clearAuditHistory(): void {
    this.auditHistory = [];
  }

  generateReport(result: AccessibilityAuditResult): string {
    const report = [
      '# Accessibility Audit Report',
      `Score: ${result.score}/100`,
      `Date: ${new Date(result.timestamp).toLocaleString()}`,
      '',
      '## Summary',
      `- Critical Issues: ${result.summary.critical}`,
      `- Major Issues: ${result.summary.major}`,
      `- Moderate Issues: ${result.summary.moderate}`,
      `- Minor Issues: ${result.summary.minor}`,
      '',
      '## Issues',
      ...result.issues.map(issue => (
        `### ${issue.element} - ${issue.category}\n` +
        `**Severity:** ${issue.severity}\n` +
        `**WCAG:** ${issue.wcagGuideline}\n` +
        `**Message:** ${issue.message}\n` +
        `**Recommendation:** ${issue.recommendation}\n`
      )),
    ].join('\n');

    return report;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const accessibilityAuditor = new AccessibilityAuditor();

// ============================================================================
// Convenience Functions
// ============================================================================

export async function auditComponent(
  component: AuditableComponent,
  config?: ComponentAccessibilityConfig,
): Promise<AccessibilityAuditResult> {
  return accessibilityAuditor.auditComponent(component, config);
}

export async function auditScreen(
  screenName: string,
  screenElement: AuditableComponent,
): Promise<AccessibilityAuditResult> {
  return accessibilityAuditor.auditScreen(screenName, screenElement);
}
