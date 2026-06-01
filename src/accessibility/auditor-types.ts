export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category:
    | 'contrast'
    | 'focus'
    | 'keyboard'
    | 'screen-reader'
    | 'motion'
    | 'color'
    | 'semantic'
    | 'touch';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
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
  category: AccessibilityIssue['category'];
  severity: AccessibilityIssue['severity'];
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
