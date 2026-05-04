/**
 * Accessibility System Export
 */

export {
  useAccessibility,
  getButtonAccessibilityProps,
  getLinkAccessibilityProps,
  getHeaderAccessibilityProps,
} from './hooks/useAccessibility';

// Phase 6.3 - Accessibility & Inclusivity
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
  type ColorBlindPalette,
  type ScreenReaderAnnouncement,
  type AnimationConfig,
  type FocusableElement,
  type AccessibilityAudit,
  type AccessibilityIssue,
  type ColorBlindType,
} from './AccessibilitySystem';
