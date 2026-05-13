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
// ============================================================================
// Accessibility Enhancement Types
// ============================================================================
// ============================================================================
// Accessibility Enhancer Class
// ============================================================================

export class AccessibilityEnhancer {
  private static instance: AccessibilityEnhancer;
  private config: AccessibilityEnhancementConfig;
  private enhancementHistory: Array<{ timestamp: number; type: string; component: string; applied: boolean; reason?: string }> = [];

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
    const EnhancedComponent = React.forwardRef<unknown, P>(
      (props, ref) => {
        const enhancedProps = this.enhanceProps(props, enhancements);

        return React.createElement(Component, {
          ...(enhancedProps as P),
          ref: ref as React.Ref<React.ComponentType<P>>,
        });
      }
    );
    EnhancedComponent.displayName = `Enhanced(${(Component as { displayName?: string; name?: string }).displayName || (Component as { name?: string }).name || 'Component'})`;
    return EnhancedComponent as unknown as React.ComponentType<P>;
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

  private getAutomaticEnhancements<P extends object>(props: P & Partial<EnhancedAccessibilityProps>): Partial<EnhancedAccessibilityProps> {
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

  private getContrastEnhancements<P extends object>(props: P & Partial<EnhancedAccessibilityProps>): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    if ('style' in props && typeof props.style === 'object' && props.style !== null) {
      const style = props.style as Record<string, string>;
      const color = typeof style['color'] === 'string' ? style['color'] : undefined;
      const backgroundColor = typeof style['backgroundColor'] === 'string' ? style['backgroundColor'] : undefined;

      if (color && backgroundColor) {
        const contrast = checkContrast(color, backgroundColor);

        if (!contrast.passesAA) {
          const alternatives = getAccessibleAlternatives(color, backgroundColor);

          if (alternatives.length > 0) {
            enhancements.style = {
              ...style,
              color: alternatives[0],
            };

            debug.info('Applied contrast enhancement:', {
              original: color,
              improved: alternatives[0],
              ratio: contrast.ratio,
            });
          }
        }
      }

      if (this.config.colorBlindSupport !== 'none') {
        if (color) {
          enhancements.style = {
            ...style,
            color: getAccessibleColor('primary', this.config.colorBlindSupport),
          };
        }
        if (backgroundColor) {
          enhancements.style = {
            ...enhancements.style || style,
            backgroundColor: getAccessibleColor('secondary', this.config.colorBlindSupport),
          };
        }
      }
    }

    return enhancements;
  }

  private getFocusEnhancements<P extends object>(props: P & Partial<EnhancedAccessibilityProps>): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Auto-add focus management for interactive elements
    if ('onPress' in props || 'onSubmit' in props || props.accessible === true) {
      enhancements.accessibilityViewIsModal = false;
      enhancements.accessibilityElementsHidden = false;
      
      // Add focus indicators for better visibility
      if (Platform.OS === 'ios') {
        enhancements.accessibilityRole = ((props as EnhancedAccessibilityProps).accessibilityRole) || 'button';
      }
    }

    return enhancements;
  }

  private getMotionEnhancements<P extends object>(props: P & Partial<EnhancedAccessibilityProps>): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Apply reduced motion preferences
    if ('animated' in props || 'useNativeDriver' in props) {
      enhancements.accessibilityReduceMotion = true;
      enhancements.accessibilityIgnoresPageScaling = false;
    }

    return enhancements;
  }

  private getScreenReaderEnhancements<P extends object>(props: P & Partial<EnhancedAccessibilityProps>): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Enhanced screen reader support
    if (props.accessible !== false) {
      // Auto-generate better labels if needed
      if (!props.accessibilityLabel && ('title' in props || 'children' in props)) {
        const children = (props as { children?: React.ReactNode }).children;
        const title = (props as { title?: string }).title;
        
        enhancements.accessibilityLabel = this.generateAccessibilityLabel({
          children,
          title,
          props,
        });
      }

      // Add semantic roles automatically
      if (!props.accessibilityRole) {
        enhancements.accessibilityRole = this.inferSemanticRole(props);
      }

      // Add accessibility hints for better UX
      if (!props.accessibilityHint && ('onPress' in props)) {
        enhancements.accessibilityHint = this.generateAccessibilityHint(props);
      }
    }

    return enhancements;
  }

  // ============================================================================
  // Label and Hint Generation
  // ============================================================================

  private generateAccessibilityLabel(options: {
    children?: React.ReactNode;
    title?: string;
    props: Record<string, unknown>;
  }): string {
    const { children, title, props } = options;

    // Use title if available
    if (title) {
      return title;
    }

    // Use children text if available
    if (children && typeof children === 'string') {
      return children;
    }

    // Generate label from props
    if (typeof props['placeholder'] === 'string') {
      return props['placeholder'];
    }

    if (typeof props['value'] === 'string') {
      return props['value'];
    }

    // Fallback to generic label
    return 'Interactive element';
  }

  private generateAccessibilityHint(props: Record<string, unknown>): string {
    // Generate hints based on element type and props
    if (props.onPress) {
      return 'Activates this control';
    }

    if (props.onLongPress) {
      return 'Long press activates this control';
    }

    if (props.onValueChange) {
      return 'Adjusts this setting';
    }

    if (props.onChangeText) {
      return 'Text input field';
    }

    return 'Interactive control';
  }

  private inferSemanticRole(props: Record<string, unknown>): string {
    // Infer semantic role from props and component type
    if (props.onPress) {
      return 'button';
    }

    if (props.onChangeText || props.value !== undefined) {
      return 'textbox';
    }

    if (props.onValueChange) {
      if (props.value === true || props.value === false) {
        return 'switch';
      }
      return 'slider';
    }

    if (props.selected !== undefined) {
      return 'radio';
    }

    return 'generic';
  }

  // ============================================================================
  // Higher-Order Components
  // ============================================================================

  createEnhancedButton<P extends object>(
    ButtonComponent: React.ComponentType<P>
  ): React.ComponentType<P> {
    return this.enhanceComponent(ButtonComponent, {
      accessibilityRole: 'button',
      accessibilityHint: 'Activates this control',
    });
  }

  createEnhancedInput<P extends object>(
    InputComponent: React.ComponentType<P>
  ): React.ComponentType<P> {
    return this.enhanceComponent(InputComponent, {
      accessibilityRole: 'textbox',
      accessibilityHint: 'Text input field',
    });
  }

  createEnhancedModal<P extends object>(
    ModalComponent: React.ComponentType<P>
  ): React.ComponentType<P> {
    return this.enhanceComponent(ModalComponent, {
      accessibilityViewIsModal: true,
      accessibilityRole: 'dialog',
    });
  }

  createEnhancedList<P extends object>(
    ListComponent: React.ComponentType<P>
  ): React.ComponentType<P> {
    return this.enhanceComponent(ListComponent, {
      accessibilityRole: 'list',
      accessibilityLabel: 'List of items',
    });
  }

  // ============================================================================
  // Enhancement History and Analytics
  // ============================================================================

  getEnhancementHistory(): Array<{ timestamp: number; type: string; component: string; applied: boolean; reason?: string }> {
    return [...this.enhancementHistory];
  }

  clearEnhancementHistory(): void {
    this.enhancementHistory = [];
    debug.info('Accessibility enhancement history cleared');
  }

  recordEnhancement(enhancement: {
    type: string;
    component: string;
    applied: boolean;
    reason?: string;
  }): void {
    this.enhancementHistory.push({
      timestamp: Date.now(),
      ...enhancement,
    });

    debug.info('Accessibility enhancement recorded:', enhancement);
  }

  // ============================================================================
  // Accessibility Health Check
  // ============================================================================

  performHealthCheck(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check configuration
    if (!this.config.autoContrastFixes) {
      issues.push('Auto-contrast fixes disabled');
      recommendations.push('Enable auto-contrast fixes for better accessibility');
      score -= 10;
    }

    if (!this.config.autoFocusManagement) {
      issues.push('Auto-focus management disabled');
      recommendations.push('Enable auto-focus management for keyboard navigation');
      score -= 10;
    }

    if (!this.config.motionOptimizations) {
      issues.push('Motion optimizations disabled');
      recommendations.push('Enable motion optimizations for users with vestibular disorders');
      score -= 10;
    }

    if (!this.config.screenReaderOptimizations) {
      issues.push('Screen reader optimizations disabled');
      recommendations.push('Enable screen reader optimizations for better assistive technology support');
      score -= 10;
    }

    // Check color blind support
    if (this.config.colorBlindSupport === 'none') {
      recommendations.push('Consider enabling color blind support for inclusivity');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const accessibilityEnhancer = AccessibilityEnhancer.getInstance();

export * from "./AccessibilityEnhancer.types";
