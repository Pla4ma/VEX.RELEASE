/**
 * Accessibility Enhancer
 * 
 * Automated accessibility improvements and fixes:
 * - Enhanced accessibility props for components
 * - Motion and animation optimizations
 * - Color contrast improvements
 * - Screen reader optimizations
 * - Focus management enhancements
 */

import React from 'react';
import { Platform } from 'react-native';
import { createDebugger } from '../utils/debug';
import { 
  getAccessibleColor, 
  getAccessibleAlternatives, 
  checkContrast,
  type ColorBlindType,
} from './AccessibilitySystem';

const debug = createDebugger('accessibility-enhancer');

// ============================================================================
// Enhanced Accessibility Props
// ============================================================================

export interface EnhancedAccessibilityProps {
  // Basic accessibility
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  
  // Enhanced accessibility
  accessibilityDescribedBy?: string;
  accessibilityLabelledBy?: string;
  accessibilityExpanded?: boolean;
  accessibilitySelected?: boolean;
  accessibilityValueMax?: number;
  accessibilityValueMin?: number;
  accessibilityValueNow?: number;
  accessibilityValueText?: string;
  accessibilityValueStep?: number;
  
  // Focus management
  accessibilityViewIsModal?: boolean;
  accessibilityElementsHidden?: boolean;
  accessibilityIgnoresInvertColors?: boolean;
  
  // Motion and animation
  accessibilityIgnoresPageScaling?: boolean;
  accessibilityReduceMotion?: boolean;
  
  // Screen reader optimizations
  accessibilityLanguage?: string;
  accessibilityAutoComplete?: string;
  accessibilityAutoCorrect?: string;
  accessibilityRequired?: boolean;
  accessibilityInvalid?: boolean;
}

// ============================================================================
// Accessibility Enhancement Types
// ============================================================================

export interface AccessibilityEnhancement {
  type: 'contrast' | 'focus' | 'motion' | 'screen-reader' | 'touch' | 'keyboard';
  priority: 'critical' | 'major' | 'moderate' | 'minor';
  enhancement: React.ComponentType<unknown> | EnhancedAccessibilityProps;
  description: string;
  wcagGuideline: string;
}

export interface AccessibilityEnhancementConfig {
  /** Enable automatic contrast improvements */
  autoContrastFixes: boolean;
  /** Enable automatic focus management */
  autoFocusManagement: boolean;
  /** Enable motion optimizations */
  motionOptimizations: boolean;
  /** Enable screen reader optimizations */
  screenReaderOptimizations: boolean;
  /** Color blind mode support */
  colorBlindSupport: ColorBlindType;
  /** Custom enhancement rules */
  customEnhancements?: AccessibilityEnhancement[];
}

// ============================================================================
// Accessibility Enhancer Class
// ============================================================================

export class AccessibilityEnhancer {
  private static instance: AccessibilityEnhancer;
  private config: AccessibilityEnhancementConfig;
  private enhancementHistory: unknown[] = [];

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

  // ============================================================================
  // Configuration Management
  // ============================================================================

  setConfig(config: Partial<AccessibilityEnhancementConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('Accessibility enhancer configuration updated:', this.config);
  }

  getConfig(): AccessibilityEnhancementConfig {
    return { ...this.config };
  }

  // ============================================================================
  // Component Enhancement Methods
  // ============================================================================

  enhanceComponent<P extends object>(
    Component: React.ComponentType<P>,
    enhancements?: Partial<EnhancedAccessibilityProps>
  ): React.ComponentType<P> {
    const EnhancedComponent = React.forwardRef<any, P>((props, ref) => {
      const enhancedProps = this.applyAccessibilityEnhancements(props, enhancements);

      return React.createElement(Component, {
        ...enhancedProps,
        ref,
      });
    });

    EnhancedComponent.displayName = `Enhanced(${Component.displayName || Component.name})`;
    return EnhancedComponent as any;
  }

  enhanceProps<P extends object>(
    props: P,
    enhancements?: Partial<EnhancedAccessibilityProps>
  ): P & EnhancedAccessibilityProps {
    const enhancedProps: EnhancedAccessibilityProps = {
      // Apply automatic enhancements
      ...this.getAutomaticEnhancements(props),
      // Apply manual enhancements
      ...enhancements,
    };

    return {
      ...props,
      ...enhancedProps,
    } as P & EnhancedAccessibilityProps;
  }

  // ============================================================================
  // Automatic Enhancement Logic
  // ============================================================================

  private getAutomaticEnhancements<P extends object>(props: P): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Auto-contrast fixes
    if (this.config.autoContrastFixes) {
      Object.assign(enhancements, this.getContrastEnhancements(props));
    }

    // Auto-focus management
    if (this.config.autoFocusManagement) {
      Object.assign(enhancements, this.getFocusEnhancements(props));
    }

    // Motion optimizations
    if (this.config.motionOptimizations) {
      Object.assign(enhancements, this.getMotionEnhancements(props));
    }

    // Screen reader optimizations
    if (this.config.screenReaderOptimizations) {
      Object.assign(enhancements, this.getScreenReaderEnhancements(props));
    }

    return enhancements;
  }

  private getContrastEnhancements<P extends object>(props: P): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Check for color props and improve contrast
    if ('style' in props && typeof props.style === 'object') {
      const style = props.style as any;
      
      if (style.color && style.backgroundColor) {
        const contrast = checkContrast(style.color, style.backgroundColor);
        
        if (!contrast.passesAA) {
          // Suggest better colors
          const alternatives = getAccessibleAlternatives(
            style.color,
            style.backgroundColor
          );
          
          if (alternatives.length > 0) {
            enhancements.style = {
              ...style,
              color: alternatives[0],
            };
            
            debug.info('Applied contrast enhancement:', {
              original: style.color,
              improved: alternatives[0],
              ratio: contrast.ratio,
            });
          }
        }
      }

      // Apply color blind mode colors
      if (this.config.colorBlindSupport !== 'none') {
        if (style.color) {
          enhancements.style = {
            ...style,
            color: getAccessibleColor('primary', this.config.colorBlindSupport),
          };
        }
        if (style.backgroundColor) {
          enhancements.style = {
            ...enhancements.style || style,
            backgroundColor: getAccessibleColor('secondary', this.config.colorBlindSupport),
          };
        }
      }
    }

    return enhancements;
  }

  private getFocusEnhancements<P extends object>(props: P): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Add focus management for interactive elements
    if ('onPress' in props || 'onLongPress' in props) {
      if (!('accessible' in props)) {
        enhancements.accessible = true;
      }
      
      if (!('accessibilityRole' in props)) {
        enhancements.accessibilityRole = 'button';
      }
    }

    // Add keyboard navigation hints
    if ('onPress' in props && !('accessibilityHint' in props)) {
      enhancements.accessibilityHint = 'Double tap to activate';
    }

    return enhancements;
  }

  private getMotionEnhancements<P extends object>(props: P): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Add reduced motion support for animated elements
    if ('animated' in props || 'useNativeDriver' in props) {
      enhancements.accessibilityReduceMotion = true;
    }

    return enhancements;
  }

  private getScreenReaderEnhancements<P extends object>(props: P): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Add semantic roles for common patterns
    if ('title' in props && !('accessibilityRole' in props)) {
      enhancements.accessibilityRole = 'header';
      enhancements.accessibilityLabel = props.title as string;
    }

    // Add live region for dynamic content
    if ('children' in props && typeof props.children === 'string') {
      const text = props.children as string;
      if (text.includes('Loading') || text.includes('Error')) {
        enhancements.accessibilityLiveRegion = 'polite';
      }
    }

    return enhancements;
  }

  private applyAccessibilityEnhancements<P extends object>(
    props: P,
    manualEnhancements?: Partial<EnhancedAccessibilityProps>
  ): P & EnhancedAccessibilityProps {
    // Apply automatic enhancements
    const automaticEnhancements = this.getAutomaticEnhancements(props);
    
    // Apply manual enhancements
    const allEnhancements = {
      ...automaticEnhancements,
      ...manualEnhancements,
    };

    // Log enhancement for debugging
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

    return {
      ...props,
      ...allEnhancements,
    } as P & EnhancedAccessibilityProps;
  }

  // ============================================================================
  // Enhancement History and Analytics
  // ============================================================================

  getEnhancementHistory(): unknown[] {
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

    this.enhancementHistory.forEach(entry => {
      // Count enhancement types
      entry.enhancements.forEach((enhancement: string) => {
        stats.enhancementTypes[enhancement] = (stats.enhancementTypes[enhancement] || 0) + 1;
      });

      // Count component enhancements
      const componentName = entry.props[0] || 'Unknown';
      stats.mostEnhancedComponents[componentName] = (stats.mostEnhancedComponents[componentName] || 0) + 1;
    });

    return stats;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const accessibilityEnhancer = AccessibilityEnhancer.getInstance();

// ============================================================================
// Convenience Functions
// ============================================================================

export function enhanceComponent<P extends object>(
  Component: React.ComponentType<P>,
  enhancements?: Partial<EnhancedAccessibilityProps>
): React.ComponentType<P> {
  return accessibilityEnhancer.enhanceComponent(Component, enhancements);
}

export function enhanceProps<P extends object>(
  props: P,
  enhancements?: Partial<EnhancedAccessibilityProps>
): P & EnhancedAccessibilityProps {
  return accessibilityEnhancer.enhanceProps(props, enhancements);
}

// ============================================================================
// Higher-Order Components
// ============================================================================

export function withAccessibility<P extends object>(
  enhancements?: Partial<EnhancedAccessibilityProps>
) {
  return function(Component: React.ComponentType<P>): React.ComponentType<P> {
    return accessibilityEnhancer.enhanceComponent(Component, enhancements);
  };
}

// ============================================================================
// React Hook for Accessibility Enhancements
// ============================================================================

export function useAccessibilityEnhancements(
  baseProps: Record<string, any>,
  customEnhancements?: Partial<EnhancedAccessibilityProps>
): EnhancedAccessibilityProps {
  const [enhancedProps, setEnhancedProps] = React.useState<EnhancedAccessibilityProps>({});

  React.useEffect(() => {
    const enhanced = accessibilityEnhancer.enhanceProps(baseProps, customEnhancements);
    setEnhancedProps(enhanced);
  }, [baseProps, customEnhancements]);

  return enhancedProps;
}

// ============================================================================
// Preset Enhancement Configurations
// ============================================================================

export const ACCESSIBILITY_PRESETS = {
  /** Maximum accessibility enhancements */
  MAXIMUM: {
    autoContrastFixes: true,
    autoFocusManagement: true,
    motionOptimizations: true,
    screenReaderOptimizations: true,
    colorBlindSupport: 'none' as ColorBlindType,
  },

  /** Essential accessibility only */
  ESSENTIAL: {
    autoContrastFixes: true,
    autoFocusManagement: true,
    motionOptimizations: false,
    screenReaderOptimizations: true,
    colorBlindSupport: 'none' as ColorBlindType,
  },

  /** Focus on visual accessibility */
  VISUAL: {
    autoContrastFixes: true,
    autoFocusManagement: false,
    motionOptimizations: true,
    screenReaderOptimizations: false,
    colorBlindSupport: 'protanopia' as ColorBlindType,
  },

  /** Focus on motor accessibility */
  MOTOR: {
    autoContrastFixes: false,
    autoFocusManagement: true,
    motionOptimizations: true,
    screenReaderOptimizations: false,
    colorBlindSupport: 'none' as ColorBlindType,
  },

  /** Focus on cognitive accessibility */
  COGNITIVE: {
    autoContrastFixes: true,
    autoFocusManagement: true,
    motionOptimizations: true,
    screenReaderOptimizations: true,
    colorBlindSupport: 'none' as ColorBlindType,
  },
} as const;

export function applyAccessibilityPreset(preset: keyof typeof ACCESSIBILITY_PRESETS): void {
  accessibilityEnhancer.setConfig(ACCESSIBILITY_PRESETS[preset]);
}