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
  style?: React.ComponentProps<any>['style'];
}

// ============================================================================
// Accessibility Enhancement Types
// ============================================================================

export interface AccessibilityEnhancement {
  type: 'contrast' | 'focus' | 'motion' | 'screen-reader' | 'touch' | 'keyboard';
  priority: 'critical' | 'major' | 'moderate' | 'minor';
  enhancement: React.ComponentType<any> | EnhancedAccessibilityProps;
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
  private enhancementHistory: any[] = [];

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

  enhanceComponent<C extends React.ComponentType<any>>(
    Component: C,
    enhancements?: Partial<EnhancedAccessibilityProps>
  ): C {
    type ComponentProps = React.ComponentProps<C>;
    type ComponentRef = React.ElementRef<C>;

    const EnhancedComponent = React.forwardRef<ComponentRef, ComponentProps>(
      (props, ref) => {
        const enhancedProps = this.enhanceProps(props, enhancements);

        return React.createElement(Component, {
          ...(enhancedProps as ComponentProps),
          ref,
        });
      }
    );
    EnhancedComponent.displayName = `Enhanced(${Component.displayName || Component.name})`;
    return EnhancedComponent as C;
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

  private getFocusEnhancements<P extends object>(props: P & Partial<EnhancedAccessibilityProps>): Partial<EnhancedAccessibilityProps> {
    const enhancements: Partial<EnhancedAccessibilityProps> = {};

    // Auto-add focus management for interactive elements
    if ('onPress' in props || 'onSubmit' in props || props.accessible === true) {
      enhancements.accessibilityViewIsModal = false;
      enhancements.accessibilityElementsHidden = false;
      
      // Add focus indicators for better visibility
      if (Platform.OS === 'ios') {
        enhancements.accessibilityRole = (props as any).accessibilityRole || 'button';
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
        const children = (props as any).children;
        const title = (props as any).title;
        
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
    children?: any;
    title?: string;
    props: any;
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
    if (props.placeholder) {
      return props.placeholder;
    }

    if (props.value && typeof props.value === 'string') {
      return props.value;
    }

    // Fallback to generic label
    return 'Interactive element';
  }

  private generateAccessibilityHint(props: any): string {
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

  private inferSemanticRole(props: any): string {
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

  getEnhancementHistory(): any[] {
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