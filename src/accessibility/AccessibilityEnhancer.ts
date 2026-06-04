import React from 'react';
import { createDebugger } from '../utils/debug';
import { getAutomaticEnhancements } from './enhancer-logic';
import { performHealthCheck } from './accessibility-health-check';
import type {
  AccessibilityEnhancementConfig,
  EnhancedAccessibilityProps,
  EnhancementHistoryEntry,
} from './enhancer-types';

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
  enhanceComponent<P extends object>(
    Component: React.ComponentType<P>,
    enhancements?: Partial<EnhancedAccessibilityProps>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<unknown>
  > {
    const EnhancedComponent = React.forwardRef<unknown, P>((props, ref) => {
      const enhancedProps = this.applyAccessibilityEnhancements(
        props,
        enhancements,
      );
      return React.createElement(Component, { ...enhancedProps, ref } as P);
    });
    EnhancedComponent.displayName = `Enhanced(${Component.displayName || Component.name})`;
    return EnhancedComponent;
  }
  enhanceProps<P extends object>(
    props: P,
    enhancements?: Partial<EnhancedAccessibilityProps>,
  ): P & EnhancedAccessibilityProps {
    const enhancedProps: EnhancedAccessibilityProps = {
      ...this.getAutomaticEnhancements(props),
      ...enhancements,
    };
    return { ...props, ...enhancedProps } as P & EnhancedAccessibilityProps;
  }
  getEnhancementHistory(): EnhancementHistoryEntry[] {
    return [...this.enhancementHistory];
  }
  clearEnhancementHistory(): void {
    this.enhancementHistory = [];
  }
  getEnhancementStats(): {
    totalEnhancements: number;
    enhancementTypes: Record<string, number>;
    mostEnhancedComponents: Record<string, number>;
  } {
    const stats = {
      totalEnhancements: this.enhancementHistory.length,
      enhancementTypes: {} as Record<string, number>,
      mostEnhancedComponents: {} as Record<string, number>,
    };
    for (const entry of this.enhancementHistory) {
      for (const enhancement of entry.enhancements) {
        stats.enhancementTypes[enhancement] =
          (stats.enhancementTypes[enhancement] ?? 0) + 1;
      }
      const componentName = entry.props[0] ?? 'Unknown';
      stats.mostEnhancedComponents[componentName] =
        (stats.mostEnhancedComponents[componentName] ?? 0) + 1;
    }
    return stats;
  }
  performHealthCheck(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    return performHealthCheck(this.config);
  }
  createEnhancedButton<P extends object>(
    Component: React.ComponentType<P>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<unknown>
  > {
    return this.enhanceComponent<P>(Component, {
      accessibilityRole: 'button',
      accessibilityViewIsModal: false,
      accessibilityElementsHidden: false,
      accessibilityIgnoresPageScaling: false,
    });
  }
  createEnhancedInput<P extends object>(
    Component: React.ComponentType<P>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<unknown>
  > {
    return this.enhanceComponent<P>(Component, {
      accessibilityRole: 'none',
      accessibilityViewIsModal: false,
      accessibilityElementsHidden: false,
      accessibilityIgnoresPageScaling: false,
    });
  }
  createEnhancedModal<P extends object>(
    Component: React.ComponentType<P>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<unknown>
  > {
    return this.enhanceComponent<P>(Component, {
      accessibilityRole: 'alert',
      accessibilityViewIsModal: true,
      accessibilityElementsHidden: false,
      accessibilityIgnoresPageScaling: false,
    });
  }
  createEnhancedList<P extends object>(
    Component: React.ComponentType<P>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<unknown>
  > {
    return this.enhanceComponent<P>(Component, {
      accessibilityRole: 'list',
      accessibilityViewIsModal: false,
      accessibilityElementsHidden: false,
      accessibilityIgnoresPageScaling: false,
    });
  }
  private getAutomaticEnhancements<P extends object>(
    props: P,
  ): Partial<EnhancedAccessibilityProps> {
    return getAutomaticEnhancements(props, this.config);
  }
  private applyAccessibilityEnhancements<P extends object>(
    props: P,
    manualEnhancements?: Partial<EnhancedAccessibilityProps>,
  ): P & EnhancedAccessibilityProps {
    const automaticEnhancements = this.getAutomaticEnhancements(props);
    const allEnhancements = { ...automaticEnhancements, ...manualEnhancements };
    if (Object.keys(allEnhancements).length > 0) {
      this.enhancementHistory.push({
        timestamp: Date.now(),
        props: Object.keys(props),
        enhancements: Object.keys(allEnhancements),
      });
      debug.debug('Applied accessibility enhancements:', {
        component: props,
        enhancements: allEnhancements,
      });
    }
    return { ...props, ...allEnhancements } as P & EnhancedAccessibilityProps;
  }
}

export const accessibilityEnhancer = AccessibilityEnhancer.getInstance();
export { ACCESSIBILITY_PRESETS, applyAccessibilityPreset } from './accessibility-presets';
export {
  enhanceComponent,
  enhanceProps,
  withAccessibility,
  useAccessibilityEnhancements,
} from './accessibility-wrappers';
