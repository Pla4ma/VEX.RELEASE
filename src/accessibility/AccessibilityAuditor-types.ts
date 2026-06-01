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

export const WCAG_GUIDELINES: Record<string, string> = {
  '1.1.1': 'Non-text Content: All non-text content has a text alternative',
  '1.2.1':
    'Audio-only and Video-only: Prerecorded content has alternatives',
  '1.3.1':
    'Adaptable: Create content that can be presented in different ways',
  '1.4.1': 'Distinguishable: Make it easier to see and hear content',
  '2.1.1':
    'Keyboard Accessible: Make all functionality available from a keyboard',
  '2.1.2': 'No Keyboard Trap: Keyboard focus should not be trapped',
  '2.2.1': 'Adjustable: Do not use content that causes seizures',
  '2.3.1':
    'Navigation from any location: Help users navigate and find content',
  '2.4.1':
    'Orientation: Content does not restrict its view to a single orientation',
  '2.5.1':
    'Input Modalities: Make functionality available from various input devices',
  '3.1.1':
    'Info and Relationships: Info, structure, and relationships can be programmatically determined',
  '3.2.1': 'Focus Visible: Any component receiving focus must be visible',
  '3.2.2': 'Focus Order: Focus order must be logical',
  '3.2.3': 'Input Assistance: Help users avoid and correct mistakes',
  '3.2.4':
    'Status Messages: Status messages can be programmatically determined',
  '3.3.1': 'Error Identification: Error messages clearly identify errors',
  '3.3.2':
    'Labels or Instructions: Labels or instructions are provided',
  '4.1.1':
    'Parsing: Content is structured so it can be parsed by assistive technologies',
  '4.1.2': 'Name, Role, Value: Components have name, role, and value',
  '4.1.3':
    'Status Properties: States can be programmatically determined',
};
