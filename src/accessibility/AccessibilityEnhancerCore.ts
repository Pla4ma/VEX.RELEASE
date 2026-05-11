/**
 * Accessibility Enhancer Core
 *
 * Automated accessibility improvements and fixes.
 */

import React from 'react';
import { createDebugger } from '../utils/debug';
import { getAutomaticEnhancements } from './enhancer-logic';
import type { AccessibilityEnhancementConfig, EnhancedAccessibilityProps, EnhancementHistoryEntry } from './enhancer-types';

const debug = createDebugger('accessibility-enhancer');

export class AccessibilityEnhancer {
  private static instance: AccessibilityEnhancer;
  private config: AccessibilityEnhancementConfig;
  private enhancementHistory: EnhancementHistoryEntry[] = [];

  private constructor() {
    this.config = {
      autoContrastFixes: true,
      autoFocusManagement: true,
      motionOptimizations: true,
      screenReaderOptimizations: true,
      colorBlindSupport: 'none',
    };
  }

  static getInstance(): AccessibilityEnhancer {
    if (!AccessibilityEnhancer.instance) {
      AccessibilityEnhancer.instance = new AccessibilityEnhancer();
    }
    return AccessibilityEnhancer.instance;
  }

  setConfig(config: Partial<AccessibilityEnhancementConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('Accessibility enhancer configuration updated:', this.config);
  }

  getConfig(): AccessibilityEnhancementConfig {
    return { ...this.config };
  }

  enhanceComponent<P extends object>(Component: React.ComponentType<P>, enhancements?: Partial<EnhancedAccessibilityProps>): React.ComponentType<P> {
    const EnhancedComponent = React.forwardRef<unknown, P>((props, ref) => {
      const enhancedProps = this.applyAccessibilityEnhancements(props, enhancements);
      return React.createElement(Component, { ...enhancedProps, ref } as P);
    });
    EnhancedComponent.displayName = `Enhanced(${Component.displayName || Component.name})`;
    return EnhancedComponent as unknown as React.ComponentType<P>;
  }

  enhanceProps<P extends object>(props: P, enhancements?: Partial<EnhancedAccessibilityProps>): P & EnhancedAccessibilityProps {
    const enhancedProps: EnhancedAccessibilityProps = {
      ...this.getAutomaticEnhancements(props),
      ...enhancements,
    };
    return { ...props, ...enhancedProps } as P & EnhancedAccessibilityProps;
  }

  private getAutomaticEnhancements<P extends object>(props: P): Partial<EnhancedAccessibilityProps> {
    return getAutomaticEnhancements(props, this.config);
  }

  private applyAccessibilityEnhancements<P extends object>(props: P, manualEnhancements?: Partial<EnhancedAccessibilityProps>): P & EnhancedAccessibilityProps {
    const automaticEnhancements = this.getAutomaticEnhancements(props);
    const allEnhancements = { ...automaticEnhancements, ...manualEnhancements };

    if (Object.keys(allEnhancements).length > 0) {
      this.enhancementHistory.push({
        timestamp: Date.now(),
        props: Object.keys(props),
        enhancements: Object.keys(allEnhancements),
      });
      debug.debug('Applied accessibility enhancements:', { component: props, enhancements: allEnhancements });
    }

    return { ...props, ...allEnhancements } as P & EnhancedAccessibilityProps;
  }

  getEnhancementHistory(): EnhancementHistoryEntry[] {
    return [...this.enhancementHistory];
  }

  clearEnhancementHistory(): void {
    this.enhancementHistory = [];
  }

  getEnhancementStats(): { totalEnhancements: number; enhancementTypes: Record<string, number>; mostEnhancedComponents: Record<string, number> } {
    const stats = { totalEnhancements: this.enhancementHistory.length, enhancementTypes: {} as Record<string, number>, mostEnhancedComponents: {} as Record<string, number> };

    this.enhancementHistory.forEach(entry => {
      entry.enhancements.forEach(enhancement => {
        stats.enhancementTypes[enhancement] = (stats.enhancementTypes[enhancement] || 0) + 1;
      });
      const componentName = entry.props[0] ?? 'Unknown';
      stats.mostEnhancedComponents[componentName] = (stats.mostEnhancedComponents[componentName] || 0) + 1;
    });

    return stats;
  }
}

export const accessibilityEnhancer = AccessibilityEnhancer.getInstance();

export function enhanceComponent<P extends object>(Component: React.ComponentType<P>, enhancements?: Partial<EnhancedAccessibilityProps>): React.ComponentType<P> {
  return accessibilityEnhancer.enhanceComponent(Component, enhancements);
}

export function enhanceProps<P extends object>(props: P, enhancements?: Partial<EnhancedAccessibilityProps>): P & EnhancedAccessibilityProps {
  return accessibilityEnhancer.enhanceProps(props, enhancements);
}

export function withAccessibility<P extends object>(enhancements?: Partial<EnhancedAccessibilityProps>) {
  return function(Component: React.ComponentType<P>): React.ComponentType<P> {
    return accessibilityEnhancer.enhanceComponent(Component, enhancements);
  };
}

export function useAccessibilityEnhancements(baseProps: Record<string, unknown>, customEnhancements?: Partial<EnhancedAccessibilityProps>): EnhancedAccessibilityProps {
  const [enhancedProps, setEnhancedProps] = React.useState<EnhancedAccessibilityProps>({});

  React.useEffect(() => {
    const enhanced = accessibilityEnhancer.enhanceProps(baseProps, customEnhancements);
    setEnhancedProps(enhanced);
  }, [baseProps, customEnhancements]);

  return enhancedProps;
}

export const ACCESSIBILITY_PRESETS = {
  MAXIMUM: { autoContrastFixes: true, autoFocusManagement: true, motionOptimizations: true, screenReaderOptimizations: true, colorBlindSupport: 'none' as const },
  ESSENTIAL: { autoContrastFixes: true, autoFocusManagement: true, motionOptimizations: false, screenReaderOptimizations: true, colorBlindSupport: 'none' as const },
  VISUAL: { autoContrastFixes: true, autoFocusManagement: false, motionOptimizations: true, screenReaderOptimizations: false, colorBlindSupport: 'protanopia' as const },
  MOTOR: { autoContrastFixes: false, autoFocusManagement: true, motionOptimizations: true, screenReaderOptimizations: false, colorBlindSupport: 'none' as const },
  COGNITIVE: { autoContrastFixes: true, autoFocusManagement: true, motionOptimizations: true, screenReaderOptimizations: true, colorBlindSupport: 'none' as const },
} as const;

export function applyAccessibilityPreset(preset: keyof typeof ACCESSIBILITY_PRESETS): void {
  accessibilityEnhancer.setConfig(ACCESSIBILITY_PRESETS[preset]);
}
