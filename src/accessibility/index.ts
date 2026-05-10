/**
 * Accessibility System Export
 *
 * Phase 6.3 - Accessibility & Inclusivity
 * WCAG 2.1 AA compliance support
 */

// Core Accessibility System
export {
  DEFAULT_ACCESSIBILITY,
  COLOR_BLIND_PALETTES,
  calculateContrastRatio,
  checkContrast,
  getAccessibleAlternatives,
  getAccessibleColor,
  getStatusPattern,
  announce,
  getRecentAnnouncements,
  generateAccessibleLabel,
  getAnimationConfig,
  getAnimationStyles,
  calculateScaledFontSize,
  getScaledTypography,
  registerFocusableElement,
  getNextFocusableElement,
  getPreviousFocusableElement,
  getAccessibilityPreferences,
  updateAccessibilityPreferences,
  detectSystemAccessibility,
  auditScreen,
  type AccessibilityPreferences,
  type ContrastCheck,
  type ColorBlindType,
  type ColorBlindPalette,
  type ScreenReaderAnnouncement,
  type AnimationConfig,
  type FocusableElement,
  type AccessibilityAudit,
  type AccessibilityIssue,
} from './AccessibilitySystem';

// Accessibility Auditor
export {
  AccessibilityAuditor,
  accessibilityAuditor,
  auditComponent,
  auditScreen as auditScreenAdvanced,
  type AccessibilityIssue as AuditIssue,
  type AccessibilityAuditResult,
  type ComponentAccessibilityConfig,
  type AccessibilityRule,
} from './AccessibilityAuditor';

// Accessibility Enhancer
export {
  AccessibilityEnhancer,
  accessibilityEnhancer,
  enhanceComponent,
  enhanceProps,
  withAccessibility,
  useAccessibilityEnhancements,
  ACCESSIBILITY_PRESETS,
  applyAccessibilityPreset,
  type EnhancedAccessibilityProps,
  type AccessibilityEnhancement,
  type AccessibilityEnhancementConfig,
} from './AccessibilityEnhancer';

// Motion Accessibility
export {
  MotionAccessibilityManager,
  motionAccessibilityManager,
  createAccessibleAnimation,
  createAccessibleAnimatedValue,
  setReducedMotion,
  triggerHapticFeedback,
  useMotionAccessibility,
  withMotionAccessibility,
  ACCESSIBLE_ANIMATION_PRESETS,
  type MotionPreferences,
  type AnimationType,
  type AnimationConfig as MotionAnimationConfig,
} from './MotionAccessibility';

// Hooks
export {
  useAccessibility,
  getButtonAccessibilityProps,
  getLinkAccessibilityProps,
  getHeaderAccessibilityProps,
} from './hooks/useAccessibility';
