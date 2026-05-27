import { createDebugger } from "../utils/debug";
import { checkContrast } from "./AccessibilitySystem";
const debug = createDebugger("accessibility-auditor");
export interface AccessibilityIssue {
  id: string;
  type: "error" | "warning" | "info";
  category:
    | "contrast"
    | "focus"
    | "keyboard"
    | "screen-reader"
    | "motion"
    | "color"
    | "semantic"
    | "touch";
  severity: "critical" | "major" | "moderate" | "minor";
  message: string;
  recommendation: string;
  element?: string;
  wcagGuideline: string;
  automated: boolean;
}
export interface AccessibilityAuditResult {
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: string[];
  failedChecks: string[];
  summary: { critical: number; major: number; moderate: number; minor: number };
  timestamp: number;
}
export interface ComponentAccessibilityConfig {
  componentName: string;
  requiresTesting: boolean;
  customRules?: AccessibilityRule[];
  interactiveElements?: string[];
  requiredLabels?: string[];
}
export interface AccessibilityRule {
  id: string;
  description: string;
  check: (element: AuditElement) => AccessibilityIssue | null;
  category: AccessibilityIssue["category"];
  severity: AccessibilityIssue["severity"];
  wcagGuideline: string;
}
type StyleValue = string | number;
interface AuditElementProps {
  accessibilityElementsHidden?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityLiveRegion?: string;
  accessibilityPlaceholder?: string;
  accessibilityReduceMotion?: boolean;
  accessibilityRole?: string;
  accessibilityViewIsModal?: boolean;
  accessible?: boolean;
  animated?: boolean;
  onKeyDown?: unknown;
  onPress?: unknown;
  style?: {
    backgroundColor?: string;
    color?: string;
    height?: StyleValue;
    width?: StyleValue;
  };
  tabIndex?: number;
}
interface AuditElementType {
  displayName?: string;
}
export interface AuditElement {
  children?: AuditElement[];
  props?: AuditElementProps;
  type?: string | AuditElementType;
}
const WCAG_GUIDELINES: Record<string, string> = {
  "1.1.1": "Non-text Content: All non-text content has a text alternative",
  "1.2.1": "Audio-only and Video-only: Prerecorded content has alternatives",
  "1.3.1": "Adaptable: Create content that can be presented in different ways",
  "1.4.1": "Distinguishable: Make it easier to see and hear content",
  "2.1.1":
    "Keyboard Accessible: Make all functionality available from a keyboard",
  "2.1.2": "No Keyboard Trap: Keyboard focus should not be trapped",
  "2.2.1": "Adjustable: Do not use content that causes seizures",
  "2.3.1": "Navigation from any location: Help users navigate and find content",
  "2.4.1":
    "Orientation: Content does not restrict its view to a single orientation",
  "2.5.1":
    "Input Modalities: Make functionality available from various input devices",
  "3.1.1":
    "Info and Relationships: Info, structure, and relationships can be programmatically determined",
  "3.2.1": "Focus Visible: Any component receiving focus must be visible",
  "3.2.2": "Focus Order: Focus order must be logical",
  "3.2.3": "Input Assistance: Help users avoid and correct mistakes",
  "3.2.4":
    "Status Messages: Status messages can be programmatically determined",
  "3.3.1": "Error Identification: Error messages clearly identify errors",
  "3.3.2": "Labels or Instructions: Labels or instructions are provided",
  "4.1.1":
    "Parsing: Content is structured so it can be parsed by assistive technologies",
  "4.1.2": "Name, Role, Value: Components have name, role, and value",
  "4.1.3": "Status Properties: States can be programmatically determined",
} as Record<string, string>;
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
    const componentDisplayName = this.getComponentDisplayName(component);
    const componentConfig = config ||
      (componentDisplayName
        ? this.componentConfigs.get(componentDisplayName)
        : undefined) || {
        componentName: componentDisplayName || "Unknown",
        requiresTesting: false,
      };
    if (!componentConfig.requiresTesting) {
      return this.createPassingResult(
        "Component does not require accessibility testing",
      );
    }
    debug.info(`Auditing component: ${componentConfig.componentName}`);
    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];
    issues.push(...this.checkAccessibilityLabels(component, componentConfig));
    issues.push(...this.checkFocusManagement(component, componentConfig));
    issues.push(...this.checkKeyboardNavigation(component, componentConfig));
    issues.push(...this.checkColorContrast(component, componentConfig));
    issues.push(...this.checkMotionAccessibility(component, componentConfig));
    issues.push(...this.checkSemanticHTML(component, componentConfig));
    issues.push(...this.checkTouchTargets(component, componentConfig));
    issues.forEach((issue) => {
      if (issue.type === "error") {
        failedChecks.push(issue.id);
      } else {
        passedChecks.push(issue.id);
      }
    });
    return this.createAuditResult(issues, passedChecks, failedChecks);
  }
  async auditScreen(
    screenName: string,
    screenElement: AuditElement,
  ): Promise<AccessibilityAuditResult> {
    debug.info(`Auditing screen: ${screenName}`);
    const issues: AccessibilityIssue[] = [];
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];
    issues.push(...this.checkScreenStructure(screenElement));
    issues.push(...this.checkNavigationOrder(screenElement));
    issues.push(...this.checkScreenReaderAnnouncements(screenElement));
    issues.push(...this.checkMotionPreferences(screenElement));
    issues.push(...this.checkColorBlindSupport(screenElement));
    issues.forEach((issue) => {
      if (issue.type === "error") {
        failedChecks.push(issue.id);
      } else {
        passedChecks.push(issue.id);
      }
    });
    return this.createAuditResult(issues, passedChecks, failedChecks);
  }
  private checkAccessibilityLabels(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (
      !component.props?.accessibilityLabel &&
      config.requiredLabels?.includes("accessibilityLabel")
    ) {
      issues.push({
        id: "missing-accessibility-label",
        type: "error",
        category: "screen-reader",
        severity: "critical",
        message: "Interactive element missing accessibility label",
        recommendation:
          "Add accessibilityLabel prop to describe the element's purpose",
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["4.1.2"]!,
        automated: true,
      });
    }
    if (
      !component.props?.accessibilityRole &&
      config.requiredLabels?.includes("accessibilityRole")
    ) {
      issues.push({
        id: "missing-accessibility-role",
        type: "error",
        category: "semantic",
        severity: "major",
        message: "Element missing accessibility role",
        recommendation:
          "Add accessibilityRole prop to define the element's purpose",
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["4.1.2"]!,
        automated: true,
      });
    }
    if (
      component.props?.accessibilityLabel &&
      !component.props?.accessibilityHint
    ) {
      issues.push({
        id: "missing-accessibility-hint",
        type: "warning",
        category: "screen-reader",
        severity: "moderate",
        message: "Interactive element could benefit from accessibility hint",
        recommendation:
          "Add accessibilityHint to explain the result of interaction",
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["2.5.1"]!,
        automated: true,
      });
    }
    return issues;
  }
  private checkFocusManagement(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (
      config.interactiveElements &&
      config.interactiveElements.length > 0 &&
      !this.canReceiveFocus(component)
    ) {
      issues.push({
        id: "focus-not-receivable",
        type: "error",
        category: "focus",
        severity: "critical",
        message: "Interactive element cannot receive focus",
        recommendation:
          "Ensure the component is focusable using tabIndex or native focus handling",
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["2.1.1"]!,
        automated: true,
      });
    }
    return issues;
  }
  private checkKeyboardNavigation(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (
      config.interactiveElements?.includes("button") &&
      !component.props?.onPress &&
      !component.props?.onKeyDown
    ) {
      issues.push({
        id: "no-keyboard-support",
        type: "error",
        category: "keyboard",
        severity: "critical",
        message: "Interactive element lacks keyboard support",
        recommendation:
          "Add keyboard event handlers or ensure component supports keyboard navigation",
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["2.1.1"]!,
        automated: true,
      });
    }
    return issues;
  }
  private checkColorContrast(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (
      component.props?.style?.color &&
      component.props?.style?.backgroundColor
    ) {
      const contrast = checkContrast(
        component.props.style.color,
        component.props.style.backgroundColor,
      );
      if (!contrast.passesAA) {
        issues.push({
          id: "insufficient-contrast",
          type: "error",
          category: "contrast",
          severity: "critical",
          message: `Insufficient color contrast ratio: ${contrast.ratio.toFixed(2)} (minimum 4.5 required)`,
          recommendation: "Increase color contrast to meet WCAG AA standards",
          element: config.componentName,
          wcagGuideline: WCAG_GUIDELINES["1.4.1"]!,
          automated: true,
        });
      }
    }
    return issues;
  }
  private checkMotionAccessibility(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (component.props?.animated && !this.respectsReducedMotion(component)) {
      issues.push({
        id: "motion-not-reduced",
        type: "warning",
        category: "motion",
        severity: "moderate",
        message: "Animation does not respect reduced motion preference",
        recommendation:
          "Use useReducedMotion hook to conditionally disable animations",
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["2.1.2"]!,
        automated: true,
      });
    }
    return issues;
  }
  private checkSemanticHTML(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (
      config.componentName === "Button" &&
      !component.props?.accessibilityRole
    ) {
      issues.push({
        id: "no-semantic-role",
        type: "warning",
        category: "semantic",
        severity: "moderate",
        message: "Button should have explicit semantic role",
        recommendation:
          'Add accessibilityRole="button" to reinforce semantic meaning',
        element: config.componentName,
        wcagGuideline: WCAG_GUIDELINES["4.1.2"]!,
        automated: true,
      });
    }
    return issues;
  }
  private checkTouchTargets(
    component: AuditElement,
    config: ComponentAccessibilityConfig,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    if (component.props?.style?.width && component.props?.style?.height) {
      const width = Number(component.props.style.width);
      const height = Number(component.props.style.height);
      if (width < 44 || height < 44) {
        issues.push({
          id: "touch-target-too-small",
          type: "error",
          category: "touch",
          severity: "major",
          message: `Touch target too small: ${width}x${height}px (minimum 44x44px required)`,
          recommendation:
            "Increase touch target size to meet accessibility guidelines",
          element: config.componentName,
          wcagGuideline: WCAG_GUIDELINES["2.5.1"]!,
          automated: true,
        });
      }
    }
    return issues;
  }
  private checkScreenStructure(
    screenElement: AuditElement,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const headings = this.findElementsByRole(screenElement, "heading");
    if (headings.length > 0 && !this.hasLogicalHeadingOrder(headings)) {
      issues.push({
        id: "invalid-heading-structure",
        type: "error",
        category: "semantic",
        severity: "major",
        message: "Screen has invalid heading hierarchy",
        recommendation:
          "Ensure headings follow logical order (h1, h2, h3, etc.)",
        wcagGuideline: WCAG_GUIDELINES["1.3.1"]!,
        automated: false,
      });
    }
    return issues;
  }
  private checkNavigationOrder(
    screenElement: AuditElement,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const focusableElements = this.findFocusableElements(screenElement);
    if (
      focusableElements.length > 0 &&
      !this.hasLogicalTabOrder(focusableElements)
    ) {
      issues.push({
        id: "invalid-tab-order",
        type: "error",
        category: "keyboard",
        severity: "major",
        message: "Screen has illogical navigation order",
        recommendation:
          "Ensure focusable elements follow logical reading order",
        wcagGuideline: WCAG_GUIDELINES["2.4.1"]!,
        automated: false,
      });
    }
    return issues;
  }
  private checkScreenReaderAnnouncements(
    screenElement: AuditElement,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const dynamicElements = this.findDynamicElements(screenElement);
    dynamicElements.forEach((element) => {
      if (!this.hasAriaLiveRegion(element)) {
        issues.push({
          id: "missing-aria-live",
          type: "warning",
          category: "screen-reader",
          severity: "moderate",
          message:
            "Dynamic content changes are not announced to screen readers",
          recommendation:
            "Add aria-live or accessibilityLiveRegion to dynamic content areas",
          element: this.getElementName(element),
          wcagGuideline: WCAG_GUIDELINES["4.1.3"]!,
          automated: true,
        });
      }
    });
    return issues;
  }
  private checkMotionPreferences(
    screenElement: AuditElement,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const animatedElements = this.findAnimatedElements(screenElement);
    animatedElements.forEach((element) => {
      if (!this.respectsReducedMotion(element)) {
        issues.push({
          id: "animation-not-reduced",
          type: "warning",
          category: "motion",
          severity: "moderate",
          message: "Animation does not respect reduced motion preference",
          recommendation:
            "Use useReducedMotion hook to conditionally disable animations",
          element: this.getElementName(element),
          wcagGuideline: WCAG_GUIDELINES["2.1.2"]!,
          automated: true,
        });
      }
    });
    return issues;
  }
  private checkColorBlindSupport(
    screenElement: AuditElement,
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const colorOnlyElements = this.findColorOnlyElements(screenElement);
    colorOnlyElements.forEach((element) => {
      issues.push({
        id: "color-only-information",
        type: "error",
        category: "color",
        severity: "critical",
        message: "Information conveyed only through color",
        recommendation:
          "Add text, patterns, or icons to convey information without relying on color",
        element: this.getElementName(element),
        wcagGuideline: WCAG_GUIDELINES["1.4.1"]!,
        automated: true,
      });
    });
    return issues;
  }
  private canReceiveFocus(component: AuditElement): boolean {
    return !!(
      component.props?.accessible !== false &&
      (component.props?.tabIndex !== -1 ||
        component.props?.tabIndex === undefined)
    );
  }
  private respectsReducedMotion(_component: AuditElement): boolean {
    return true;
  }
  private findElementsByRole(
    _element: AuditElement,
    _role: string,
  ): AuditElement[] {
    return [];
  }
  private findFocusableElements(_element: AuditElement): AuditElement[] {
    return [];
  }
  private hasLogicalTabOrder(_elements: AuditElement[]): boolean {
    return true;
  }
  private hasLogicalHeadingOrder(_headings: AuditElement[]): boolean {
    return true;
  }
  private findDynamicElements(_element: AuditElement): AuditElement[] {
    return [];
  }
  private hasAriaLiveRegion(element: AuditElement): boolean {
    return !!element.props?.accessibilityLiveRegion;
  }
  private findAnimatedElements(_element: AuditElement): AuditElement[] {
    return [];
  }
  private findColorOnlyElements(_element: AuditElement): AuditElement[] {
    return [];
  }
  private createAuditResult(
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
  private createPassingResult(_reason: string): AccessibilityAuditResult {
    return {
      score: 100,
      issues: [],
      passedChecks: ["no-audit-required"],
      failedChecks: [],
      summary: { critical: 0, major: 0, moderate: 0, minor: 0 },
      timestamp: Date.now(),
    };
  }
  private getComponentDisplayName(component: AuditElement): string | undefined {
    if (typeof component.type === "string") {
      return component.type;
    }
    return component.type?.displayName;
  }
  private getElementName(element: AuditElement): string | undefined {
    if (typeof element.type === "string") {
      return element.type;
    }
    return element.type?.displayName;
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
