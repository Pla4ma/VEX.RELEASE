/**
 * Accessibility System — barrel re-export.
 *
 * Original monolith split into focused modules:
 *   types.ts            — interfaces, type aliases, defaults
 *   contrastUtils.ts    — contrast calculation helpers
 *   colorBlindPalettes.ts — WCAG color-blind palette data
 *   screenReaderUtils.ts  — announcements & label generation
 *   animationUtils.ts   — animation config & typography scaling
 *   focusManagement.ts  — focus navigation & element registration
 *   preferences.ts      — user accessibility preferences
 *   audit.ts            — screen accessibility auditing
 */

export {
  type AccessibilityPreferences,
  DEFAULT_ACCESSIBILITY,
  type ContrastCheck,
  type ColorBlindType,
  type ColorBlindPalette,
  type ScreenReaderAnnouncement,
  type AnimationConfig,
  type FocusableElement,
  type AccessibilityAudit,
  type AccessibilityIssue,
} from './types';

export {
  calculateContrastRatio,
  checkContrast,
  getAccessibleAlternatives,
} from './contrastUtils';

export {
  COLOR_BLIND_PALETTES,
  getAccessibleColor,
  getStatusPattern,
} from './colorBlindPalettes';

export {
  announce,
  getRecentAnnouncements,
  generateAccessibleLabel,
} from './screenReaderUtils';

export {
  getAnimationConfig,
  getAnimationStyles,
  calculateScaledFontSize,
  getScaledTypography,
} from './animationUtils';

export {
  registerFocusableElement,
  getNextFocusableElement,
  getPreviousFocusableElement,
} from './focusManagement';

export {
  getAccessibilityPreferences,
  updateAccessibilityPreferences,
  detectSystemAccessibility,
} from './preferences';

export { auditScreen } from './audit';
