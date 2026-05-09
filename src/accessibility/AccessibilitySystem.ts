/**
 * Accessibility System Barrel
 *
 * Re-exports the split implementation modules so callers can import from
 * a single location while each module stays under the 200 line limit.
 */

export {
  DEFAULT_ACCESSIBILITY,
  COLOR_BLIND_PALETTES,
} from './constants';

export {
  calculateContrastRatio,
  checkContrast,
  getAccessibleAlternatives,
} from './contrast';

export {
  getAccessibleColor,
  getStatusPattern,
  getColorBlindPalettes,
  isColorAccessibleForColorBlind,
} from './color-blind';

export {
  announce,
  getRecentAnnouncements,
  generateAccessibleLabel,
  clearOldAnnouncements,
} from './screen-reader';

export {
  getAnimationConfig,
  getAnimationStyles,
  calculateScaledFontSize,
  getScaledTypography,
} from './motion';

export {
  registerFocusableElement,
  getNextFocusableElement,
  getPreviousFocusableElement,
  unregisterFocusableElement,
  getFocusableElements,
} from './focus';

export {
  getAccessibilityPreferences,
  updateAccessibilityPreferences,
  resetAccessibilityPreferences,
  detectSystemAccessibility,
} from './preferences';

export {
  auditScreen,
  auditColorContrast,
} from './audit';

export type {
  AccessibilityPreferences,
  ColorBlindPalette,
  ContrastCheck,
  ScreenReaderAnnouncement,
  AnimationConfig,
  ColorBlindType,
  FocusableElement,
  AccessibilityIssue,
  AccessibilityAudit,
} from './types';
