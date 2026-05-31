/**
 * Accessibility Enhancer Helpers
 *
 * Convenience functions, presets, and the singleton instance.
 */

import React from 'react';
import { AccessibilityEnhancer } from './AccessibilityEnhancer.class';
import type { EnhancedAccessibilityProps } from './enhancer-types';

export const accessibilityEnhancer = AccessibilityEnhancer.getInstance();

export function enhanceComponent<P extends object>(
  Component: React.ComponentType<P>,
  enhancements?: Partial<EnhancedAccessibilityProps>,
): React.ComponentType<P> {
  return accessibilityEnhancer.enhanceComponent(Component, enhancements);
}

export function enhanceProps<P extends object>(
  props: P,
  enhancements?: Partial<EnhancedAccessibilityProps>,
): P & EnhancedAccessibilityProps {
  return accessibilityEnhancer.enhanceProps(props, enhancements);
}

export function withAccessibility<P extends object>(
  enhancements?: Partial<EnhancedAccessibilityProps>,
) {
  return function (Component: React.ComponentType<P>): React.ComponentType<P> {
    return accessibilityEnhancer.enhanceComponent(Component, enhancements);
  };
}

export function useAccessibilityEnhancements(
  baseProps: Record<string, unknown>,
  customEnhancements?: Partial<EnhancedAccessibilityProps>,
): EnhancedAccessibilityProps {
  const [enhancedProps, setEnhancedProps] =
    React.useState<EnhancedAccessibilityProps>({});

  React.useEffect(() => {
    const enhanced = accessibilityEnhancer.enhanceProps(
      baseProps,
      customEnhancements,
    );
    setEnhancedProps(enhanced);
  }, [baseProps, customEnhancements]);

  return enhancedProps;
}

export const ACCESSIBILITY_PRESETS = {
  MAXIMUM: {
    autoContrastFixes: true,
    autoFocusManagement: true,
    motionOptimizations: true,
    screenReaderOptimizations: true,
    colorBlindSupport: 'none' as const,
  },
  ESSENTIAL: {
    autoContrastFixes: true,
    autoFocusManagement: true,
    motionOptimizations: false,
    screenReaderOptimizations: true,
    colorBlindSupport: 'none' as const,
  },
  VISUAL: {
    autoContrastFixes: true,
    autoFocusManagement: false,
    motionOptimizations: true,
    screenReaderOptimizations: false,
    colorBlindSupport: 'protanopia' as const,
  },
  MOTOR: {
    autoContrastFixes: false,
    autoFocusManagement: true,
    motionOptimizations: true,
    screenReaderOptimizations: false,
    colorBlindSupport: 'none' as const,
  },
  COGNITIVE: {
    autoContrastFixes: true,
    autoFocusManagement: true,
    motionOptimizations: true,
    screenReaderOptimizations: true,
    colorBlindSupport: 'none' as const,
  },
} as const;

export function applyAccessibilityPreset(
  preset: keyof typeof ACCESSIBILITY_PRESETS,
): void {
  accessibilityEnhancer.setConfig(ACCESSIBILITY_PRESETS[preset]);
}
