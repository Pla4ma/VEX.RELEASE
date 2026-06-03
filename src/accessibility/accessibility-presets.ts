import { accessibilityEnhancer } from './AccessibilityEnhancer';

export const ACCESSIBILITY_PRESETS = {
  MAXIMUM: { autoContrastFixes: true, autoFocusManagement: true, motionOptimizations: true, screenReaderOptimizations: true, colorBlindSupport: 'none' as const },
  ESSENTIAL: { autoContrastFixes: true, autoFocusManagement: true, motionOptimizations: false, screenReaderOptimizations: true, colorBlindSupport: 'none' as const },
  VISUAL: { autoContrastFixes: true, autoFocusManagement: false, motionOptimizations: true, screenReaderOptimizations: false, colorBlindSupport: 'protanopia' as const },
  MOTOR: { autoContrastFixes: false, autoFocusManagement: true, motionOptimizations: true, screenReaderOptimizations: false, colorBlindSupport: 'none' as const },
  COGNITIVE: { autoContrastFixes: true, autoFocusManagement: true, motionOptimizations: true, screenReaderOptimizations: true, colorBlindSupport: 'none' as const },
} as const;

export function applyAccessibilityPreset(
  preset: keyof typeof ACCESSIBILITY_PRESETS,
): void {
  accessibilityEnhancer.setConfig(ACCESSIBILITY_PRESETS[preset]);
}
