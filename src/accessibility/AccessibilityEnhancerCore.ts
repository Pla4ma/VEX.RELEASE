/**
 * Accessibility Enhancer Core
 *
 * Automated accessibility improvements and fixes.
 * Re-exports from class and helpers modules.
 */

export { AccessibilityEnhancer } from './AccessibilityEnhancer.class';

export {
  accessibilityEnhancer,
  enhanceComponent,
  enhanceProps,
  withAccessibility,
  useAccessibilityEnhancements,
  ACCESSIBILITY_PRESETS,
  applyAccessibilityPreset,
} from './AccessibilityEnhancer.helpers';
