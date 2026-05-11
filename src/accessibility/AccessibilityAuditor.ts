/**
 * Accessibility Auditor
 *
 * Comprehensive accessibility audit system for WCAG 2.1 AA compliance.
 */

import { createDebugger } from '../utils/debug';
import type { AuditableComponent, ComponentAccessibilityConfig, AccessibilityAuditResult, AuditAccessibilityIssue } from './types';
import { WCAG_GUIDELINES } from './wcag';
import { runComponentChecks, runScreenChecks } from './checks';

const debug = createDebugger('accessibility-auditor');

const DEFAULT_CONFIGS: ComponentAccessibilityConfig[] = [
  { componentName: 'Button', requiresTesting: true, interactiveElements: ['button'], requiredLabels: ['accessibilityLabel'] },
  { componentName: 'TextInput', requiresTesting: true, interactiveElements: ['input', 'textarea'], requiredLabels: ['accessibilityLabel', 'accessibilityPlaceholder'] },
  { componentName: 'TouchableOpacity', requiresTesting: true, interactiveElements: ['button', 'link'], requiredLabels: ['accessibilityLabel'] },
  { componentName: 'Modal', requiresTesting: true, interactiveElements: ['dialog'], requiredLabels: ['accessibilityLabel', 'accessibilityRole'] },
  { componentName: 'FlatList', requiresTesting: true, interactiveElements: ['list', 'listitem'], requiredLabels: ['accessibilityLabel'] },
  { componentName: 'TabBar', requiresTesting: true, interactiveElements: ['tab'], requiredLabels: ['accessibilityLabel'] },
];

export class AccessibilityAuditor {
  private auditHistory: AccessibilityAuditResult[] = [];
  private componentConfigs: Map<string, ComponentAccessibilityConfig> = new Map();

  constructor() {
    DEFAULT_CONFIGS.forEach(config => this.componentConfigs.set(config.componentName, config));
  }

  registerComponentConfig(config: ComponentAccessibilityConfig): void {
    this.componentConfigs.set(config.componentName, config);
    debug.info(`Registered accessibility config for component: ${config.componentName}`);
  }

  async auditComponent(component: AuditableComponent, config?: ComponentAccessibilityConfig): Promise<AccessibilityAuditResult> {
    const displayName = typeof component.type === 'object' ? component.type?.displayName : undefined;
    const componentConfig = config || (displayName ? this.componentConfigs.get(displayName) : undefined) || {
      componentName: 'Unknown',
      requiresTesting: false,
    };

    if (!componentConfig.requiresTesting) {
      return this.createPassingResult('Component does not require accessibility testing');
    }

    debug.info(`Auditing component: ${componentConfig.componentName}`);
    const issues = runComponentChecks(component, componentConfig);
    const passedChecks = issues.filter(i => i.type !== 'error').map(i => i.id);
    const failedChecks = issues.filter(i => i.type === 'error').map(i => i.id);

    return this.createAuditResult(issues, passedChecks, failedChecks);
  }

  async auditScreen(screenName: string, screenElement: AuditableComponent): Promise<AccessibilityAuditResult> {
    debug.info(`Auditing screen: ${screenName}`);
    const issues = runScreenChecks(screenElement);
    const passedChecks = issues.filter(i => i.type !== 'error').map(i => i.id);
    const failedChecks = issues.filter(i => i.type === 'error').map(i => i.id);
    return this.createAuditResult(issues, passedChecks, failedChecks);
  }

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

  private createAuditResult(issues: AuditAccessibilityIssue[], passedChecks: string[], failedChecks: string[]): AccessibilityAuditResult {
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 25; break;
        case 'major': score -= 15; break;
        case 'moderate': score -= 10; break;
        case 'minor': score -= 5; break;
      }
    });
    score = Math.max(0, score);

    const summary = {
      critical: issues.filter(i => i.severity === 'critical').length,
      major: issues.filter(i => i.severity === 'major').length,
      moderate: issues.filter(i => i.severity === 'moderate').length,
      minor: issues.filter(i => i.severity === 'minor').length,
    };

    const result = { score, issues, passedChecks, failedChecks, summary, timestamp: Date.now() };
    this.auditHistory.push(result);
    return result;
  }

  private createPassingResult(_message: string): AccessibilityAuditResult {
    return {
      score: 100,
      issues: [],
      passedChecks: ['no-audit-required'],
      failedChecks: [],
      summary: { critical: 0, major: 0, moderate: 0, minor: 0 },
      timestamp: Date.now(),
    };
  }
}

export const accessibilityAuditor = new AccessibilityAuditor();

export async function auditComponent(
  component: AuditableComponent,
  config?: ComponentAccessibilityConfig
): Promise<AccessibilityAuditResult> {
  return accessibilityAuditor.auditComponent(component, config);
}

export async function auditScreen(
  screenName: string,
  screenElement: AuditableComponent
): Promise<AccessibilityAuditResult> {
  return accessibilityAuditor.auditScreen(screenName, screenElement);
}

export { WCAG_GUIDELINES };
export type { ComponentAccessibilityConfig, AccessibilityAuditResult, AuditAccessibilityIssue, AuditableComponent } from './types';
