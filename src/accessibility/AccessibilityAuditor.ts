import { createDebugger } from "../utils/debug";
import type {
  AccessibilityIssue,
  AccessibilityAuditResult,
  ComponentAccessibilityConfig,
  AuditElement,
} from "./AccessibilityAuditor-types";
import {
  createAuditResult,
  createPassingResult,
  getComponentDisplayName,
} from "./AccessibilityAuditor-helpers";
import {
  checkScreenStructure,
  checkNavigationOrder,
  checkScreenReaderAnnouncements,
  checkMotionPreferences,
  checkColorBlindSupport,
} from "./AccessibilityAuditor-utils";
import {
  checkAccessibilityLabels,
  checkFocusManagement,
  checkKeyboardNavigation,
  checkColorContrast,
  checkMotionAccessibility,
  checkSemanticHTML,
  checkTouchTargets,
} from "./AccessibilityAuditor-checks";

const debug = createDebugger("accessibility-auditor");

export class AccessibilityAuditor {
  private auditHistory: AccessibilityAuditResult[] = [];
  private componentConfigs: Map<string, ComponentAccessibilityConfig> =
    new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    const defaultConfigs: ComponentAccessibilityConfig[] = [
      {
        componentName: "Button",
        requiresTesting: true,
        interactiveElements: ["button"],
        requiredLabels: ["accessibilityLabel"],
      },
      {
        componentName: "TextInput",
        requiresTesting: true,
        interactiveElements: ["input", "textarea"],
        requiredLabels: ["accessibilityLabel", "accessibilityPlaceholder"],
      },
      {
        componentName: "TouchableOpacity",
        requiresTesting: true,
        interactiveElements: ["button", "link"],
        requiredLabels: ["accessibilityLabel"],
      },
      {
        componentName: "Modal",
        requiresTesting: true,
        interactiveElements: ["dialog"],
        requiredLabels: ["accessibilityLabel", "accessibilityRole"],
      },
      {
        componentName: "VirtualizedList",
        requiresTesting: true,
        interactiveElements: ["list", "listitem"],
        requiredLabels: ["accessibilityLabel"],
      },
      {
        componentName: "TabBar",
        requiresTesting: true,
        interactiveElements: ["tab"],
        requiredLabels: ["accessibilityLabel"],
      },
    ];
    defaultConfigs.forEach((config) => {
      this.componentConfigs.set(config.componentName, config);
    });
  }

  registerComponentConfig(config: ComponentAccessibilityConfig): void {
    this.componentConfigs.set(config.componentName, config);
    debug.info(
      `Registered accessibility config for component: ${config.componentName}`,
    );
  }

  async auditComponent(
    component: AuditElement,
    config?: ComponentAccessibilityConfig,
  ): Promise<AccessibilityAuditResult> {
    const componentDisplayName = getComponentDisplayName(component);
    const componentConfig = config ||
      (componentDisplayName
        ? this.componentConfigs.get(componentDisplayName)
        : undefined) || {
        componentName: componentDisplayName || "Unknown",
        requiresTesting: false,
      };
    if (!componentConfig.requiresTesting) {
      return createPassingResult(
        "Component does not require accessibility testing",
      );
    }
    debug.info(`Auditing component: ${componentConfig.componentName}`);
    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];
    issues.push(...checkAccessibilityLabels(component, componentConfig));
    issues.push(...checkFocusManagement(component, componentConfig));
    issues.push(...checkKeyboardNavigation(component, componentConfig));
    issues.push(...checkColorContrast(component, componentConfig));
    issues.push(...checkMotionAccessibility(component, componentConfig));
    issues.push(...checkSemanticHTML(component, componentConfig));
    issues.push(...checkTouchTargets(component, componentConfig));
    issues.forEach((issue) => {
      if (issue.type === "error") {
        failedChecks.push(issue.id);
      } else {
        passedChecks.push(issue.id);
      }
    });
    return createAuditResult(issues, passedChecks, failedChecks);
  }

  async auditScreen(
    screenName: string,
    screenElement: AuditElement,
  ): Promise<AccessibilityAuditResult> {
    debug.info(`Auditing screen: ${screenName}`);
    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];
    issues.push(...checkScreenStructure(screenElement));
    issues.push(...checkNavigationOrder(screenElement));
    issues.push(...checkScreenReaderAnnouncements(screenElement));
    issues.push(...checkMotionPreferences(screenElement));
    issues.push(...checkColorBlindSupport(screenElement));
    issues.forEach((issue) => {
      if (issue.type === "error") {
        failedChecks.push(issue.id);
      } else {
        passedChecks.push(issue.id);
      }
    });
    return createAuditResult(issues, passedChecks, failedChecks);
  }

  getAuditHistory(): AccessibilityAuditResult[] {
    return [...this.auditHistory];
  }

  clearAuditHistory(): void {
    this.auditHistory = [];
    debug.info("Accessibility audit history cleared");
  }

  generateReport(auditResult: AccessibilityAuditResult): string {
    const { score, issues, summary } = auditResult;
    let report = "# Accessibility Audit Report\n\n";
    report += `**Overall Score: ${score}/100**\n\n`;
    report += "## Issue Summary\n";
    report += `- Critical: ${summary.critical}\n`;
    report += `- Major: ${summary.major}\n`;
    report += `- Moderate: ${summary.moderate}\n`;
    report += `- Minor: ${summary.minor}\n\n`;
    if (issues.length > 0) {
      report += "## Issues Found\n\n";
      issues.forEach((issue) => {
        report += `### ${issue.category.toUpperCase()}: ${issue.message}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **WCAG Guideline:** ${issue.wcagGuideline}\n`;
        report += `- **Recommendation:** ${issue.recommendation}\n`;
        if (issue.element) {
          report += `- **Element:** ${issue.element}\n`;
        }
        report += `- **Automated:** ${issue.automated ? "Yes" : "No"}\n\n`;
      });
    } else {
      report += "## ✅ No accessibility issues found!\n";
    }
    return report;
  }
}

export const accessibilityAuditor = new AccessibilityAuditor();

export type {
  AccessibilityIssue,
  AccessibilityAuditResult,
  ComponentAccessibilityConfig,
  AccessibilityRule,
  AuditElement,
} from "./AccessibilityAuditor-types";
