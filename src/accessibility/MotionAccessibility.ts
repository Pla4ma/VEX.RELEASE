/**
 * Motion Accessibility System
 * 
 * Ensures animations and transitions respect user preferences
 * and provide alternatives for users with vestibular disorders.
 */

import React from 'react';
import { Animated, Platform, Easing } from 'react-native';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('motion-accessibility');

// ============================================================================
// Motion Preferences Types
// ============================================================================

export interface MotionPreferences {
  /** User prefers reduced motion */
  reducedMotion: boolean;
  /** Animation duration multiplier */
  animationDurationMultiplier: number;
  /** Parallax effects enabled */
  parallaxEnabled: boolean;
  /** Spring animations enabled */
  springAnimationsEnabled: boolean;
  /** Transition animations enabled */
  transitionAnimationsEnabled: boolean;
  /** Haptic feedback enabled */
  hapticFeedbackEnabled: boolean;
}

export const DEFAULT_MOTION_PREFERENCES: MotionPreferences = {
  reducedMotion: false,
  animationDurationMultiplier: 1.0,
  parallaxEnabled: true,
  springAnimationsEnabled: true,
  transitionAnimationsEnabled: true,
  hapticFeedbackEnabled: true,
};

// ============================================================================
// Motion Animation Types
// ============================================================================

export type AnimationType = 
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'spring'
  | 'parallax'
  | 'transition';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay?: number;
  easing?: string;
  useNativeDriver?: boolean;
  reducedMotionAlternative?: 'fade' | 'none' | 'instant';
}

// ============================================================================
// Motion Accessibility Manager
// ============================================================================

export class MotionAccessibilityManager {
  private static instance: MotionAccessibilityManager;
  private preferences: MotionPreferences;
  private animationRegistry: Map<string, Animated.Value> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.preferences = { ...DEFAULT_MOTION_PREFERENCES };
    this.loadPreferences();
  }

  static getInstance(): MotionAccessibilityManager {
    if (!MotionAccessibilityManager.instance) {
      MotionAccessibilityManager.instance = new MotionAccessibilityManager();
    }
    return MotionAccessibilityManager.instance;
  }

  // ============================================================================
  // Preference Management
  // ============================================================================

  getPreferences(): MotionPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<MotionPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    this.notifyListeners();
    debug.info('Motion preferences updated:', this.preferences);
  }

  setReducedMotion(enabled: boolean): void {
    this.updatePreferences({ reducedMotion: enabled });
  }

  setAnimationDurationMultiplier(multiplier: number): void {
    this.updatePreferences({ animationDurationMultiplier: Math.max(0.1, multiplier) });
  }

  enableParallax(enabled: boolean): void {
    this.updatePreferences({ parallaxEnabled: enabled });
  }

  enableHapticFeedback(enabled: boolean): void {
    this.updatePreferences({ hapticFeedbackEnabled: enabled });
  }

  // ============================================================================
  // Animation Creation with Accessibility
  // ============================================================================

  createAnimatedValue(initialValue: number = 0, key?: string): Animated.Value {
    const animatedValue = new Animated.Value(initialValue);
    
    if (key) {
      this.animationRegistry.set(key, animatedValue);
    }
    
    return animatedValue;
  }

  createAnimation(config: AnimationConfig): Animated.CompositeAnimation {
    const adjustedConfig = this.adjustAnimationForAccessibility(config);
    
    debug.debug('Creating animation with accessibility adjustments:', {
      original: config,
      adjusted: adjustedConfig,
    });

    switch (adjustedConfig.type) {
      case 'fade':
        return Animated.timing(
          this.getOrCreateAnimatedValue('fade'),
          {
            toValue: 1,
            duration: adjustedConfig.duration || 300,
            delay: adjustedConfig.delay || 0,
            easing: adjustedConfig.easing ? this.parseEasing(adjustedConfig.easing) : Easing.out(Easing.quad),
            useNativeDriver: adjustedConfig.useNativeDriver || true,
          }
        );

      case 'slide':
        return Animated.timing(
          this.getOrCreateAnimatedValue('slide'),
          {
            toValue: 1,
            duration: adjustedConfig.duration || 300,
            delay: adjustedConfig.delay || 0,
            easing: adjustedConfig.easing ? this.parseEasing(adjustedConfig.easing) : Easing.out(Easing.quad),
            useNativeDriver: adjustedConfig.useNativeDriver || true,
          }
        );

      case 'scale':
        return Animated.timing(
          this.getOrCreateAnimatedValue('scale'),
          {
            toValue: 1,
            duration: adjustedConfig.duration || 300,
            delay: adjustedConfig.delay || 0,
            easing: adjustedConfig.easing ? this.parseEasing(adjustedConfig.easing) : Easing.out(Easing.quad),
            useNativeDriver: adjustedConfig.useNativeDriver || true,
          }
        );

      case 'spring':
        if (this.preferences.springAnimationsEnabled) {
          return Animated.spring(
            this.getOrCreateAnimatedValue('spring'),
            {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: adjustedConfig.useNativeDriver || true,
            }
          );
        } else {
          // Fallback to timing animation
          return Animated.timing(
            this.getOrCreateAnimatedValue('spring'),
            {
              toValue: 1,
              duration: adjustedConfig.duration || 300,
              useNativeDriver: adjustedConfig.useNativeDriver || true,
            }
          );
        }

      case 'parallax':
        if (this.preferences.parallaxEnabled) {
          return Animated.timing(
            this.getOrCreateAnimatedValue('parallax'),
            {
              toValue: 1,
              duration: adjustedConfig.duration || 300,
              useNativeDriver: adjustedConfig.useNativeDriver || true,
            }
          );
        } else {
          // No animation for parallax when disabled
          return Animated.timing(
            this.getOrCreateAnimatedValue('parallax'),
            {
              toValue: 1,
              duration: 0,
              useNativeDriver: adjustedConfig.useNativeDriver || true,
            }
          );
        }

      default:
        return Animated.timing(
          this.getOrCreateAnimatedValue('default'),
          {
            toValue: 1,
            duration: adjustedConfig.duration || 300,
            delay: adjustedConfig.delay || 0,
            easing: adjustedConfig.easing ? this.parseEasing(adjustedConfig.easing) : Easing.out(Easing.quad),
            useNativeDriver: adjustedConfig.useNativeDriver || true,
          }
        );
    }
  }

  createTransition(
    fromValue: Animated.Value,
    toValue: Animated.Value,
    config: AnimationConfig
  ): Animated.CompositeAnimation {
    const adjustedConfig = this.adjustAnimationForAccessibility(config);
    
    return Animated.timing(fromValue, {
      toValue: toValue,
      duration: adjustedConfig.duration || 300,
      delay: adjustedConfig.delay || 0,
      easing: adjustedConfig.easing ? this.parseEasing(adjustedConfig.easing) : Easing.out(Easing.quad),
      useNativeDriver: adjustedConfig.useNativeDriver || true,
    });
  }

  // ============================================================================
  // Accessibility Adjustments
  // ============================================================================

  private adjustAnimationForAccessibility(config: AnimationConfig): AnimationConfig {
    const adjusted = { ...config };

    // Apply reduced motion
    if (this.preferences.reducedMotion) {
      switch (config.reducedMotionAlternative) {
        case 'none':
          adjusted.duration = 0;
          break;
        case 'instant':
          adjusted.duration = 50;
          break;
        case 'fade':
          adjusted.type = 'fade';
          adjusted.duration = 150;
          break;
        default:
          adjusted.duration = Math.min(config.duration, 200);
      }
    }

    // Apply duration multiplier
    adjusted.duration = Math.round(
      adjusted.duration * this.preferences.animationDurationMultiplier
    );

    // Disable specific animation types
    if (!this.preferences.transitionAnimationsEnabled && 
        ['slide', 'scale', 'rotate'].includes(config.type)) {
      adjusted.type = 'fade';
      adjusted.duration = Math.min(adjusted.duration, 200);
    }

    return adjusted;
  }

  private parseEasing(easingString: string): Animated.TimingAnimationConfig['easing'] {
    switch (easingString) {
      case 'linear':
        return Easing.linear;
      case 'ease-in':
        return Easing.in;
      case 'ease-out':
        return Easing.out;
      case 'ease-in-out':
        return Easing.inOut;
      case 'ease-in-quad':
        return Easing.in(Easing.quad);
      case 'ease-out-quad':
        return Easing.out(Easing.quad);
      case 'ease-in-out-quad':
        return Easing.inOut(Easing.quad);
      default:
        return Easing.out(Easing.quad);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private getOrCreateAnimatedValue(key: string): Animated.Value {
    if (!this.animationRegistry.has(key)) {
      this.animationRegistry.set(key, new Animated.Value(0));
    }
    return this.animationRegistry.get(key)!;
  }

  private loadPreferences(): void {
    try {
      // In a real implementation, this would load from secure storage
      // For now, use defaults
      debug.debug('Loaded motion preferences (using defaults)');
    } catch (error) {
      debug.error('Failed to load motion preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      // In a real implementation, this would save to secure storage
      debug.debug('Saved motion preferences:', this.preferences);
    } catch (error) {
      debug.error('Failed to save motion preferences:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // ============================================================================
  // Public API
  // ============================================================================

  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  // ============================================================================
  // Haptic Feedback
  // ============================================================================

  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    if (!this.preferences.hapticFeedbackEnabled) {
      return;
    }

    // In a real implementation, this would use Expo Haptics
    debug.debug(`Haptic feedback triggered: ${type}`);
  }

  // ============================================================================
  // Motion Detection
  // ============================================================================

  async detectSystemMotionPreferences(): Promise<Partial<MotionPreferences>> {
    try {
      // In a real implementation, this would use platform APIs
      // For React Native: AccessibilityInfo.isReduceMotionEnabled()
      
      // For now, return defaults
      return {
        reducedMotion: false,
      };
    } catch (error) {
      debug.error('Failed to detect system motion preferences:', error);
      return {};
    }
  }

  // ============================================================================
  // Animation Utilities
  // ============================================================================

  createSafeAnimation(
    animation: () => Animated.CompositeAnimation,
    fallback?: () => void
  ): Animated.CompositeAnimation {
    try {
      return animation();
    } catch (error) {
      debug.error('Animation creation failed, using fallback:', error);
      
      if (fallback) {
        fallback();
      }
      
      // Return a no-op animation
      return Animated.timing(new Animated.Value(0), {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      });
    }
  }

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  getPerformanceStats(): {
    totalAnimations: number;
    activeAnimations: number;
    averageDuration: number;
    reducedMotionUsage: number;
  } {
    const totalAnimations = this.animationRegistry.size;
    const reducedMotionUsage = this.preferences.reducedMotion ? 1 : 0;

    return {
      totalAnimations,
      activeAnimations: 0, // Would need tracking of running animations
      averageDuration: 300, // Would need calculation from actual usage
      reducedMotionUsage,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const motionAccessibilityManager = MotionAccessibilityManager.getInstance();

// ============================================================================
// Convenience Functions
// ============================================================================

export function createAccessibleAnimation(config: AnimationConfig): Animated.CompositeAnimation {
  return motionAccessibilityManager.createAnimation(config);
}

export function createAccessibleAnimatedValue(initialValue?: number, key?: string): Animated.Value {
  return motionAccessibilityManager.createAnimatedValue(initialValue, key);
}

export function setReducedMotion(enabled: boolean): void {
  motionAccessibilityManager.setReducedMotion(enabled);
}

export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
  motionAccessibilityManager.triggerHapticFeedback(type);
}

// ============================================================================
// React Hook
// ============================================================================

export function useMotionAccessibility(): MotionPreferences & {
  updatePreferences: (updates: Partial<MotionPreferences>) => void;
  createAnimation: (config: AnimationConfig) => Animated.CompositeAnimation;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
} {
  const [preferences, setPreferences] = React.useState<MotionPreferences>(
    motionAccessibilityManager.getPreferences()
  );

  React.useEffect(() => {
    const unsubscribe = motionAccessibilityManager.addListener(() => {
      setPreferences(motionAccessibilityManager.getPreferences());
    });

    return unsubscribe;
  }, []);

  const updatePreferences = React.useCallback((updates: Partial<MotionPreferences>) => {
    motionAccessibilityManager.updatePreferences(updates);
  }, []);

  const createAnimation = React.useCallback((config: AnimationConfig) => {
    return motionAccessibilityManager.createAnimation(config);
  }, []);

  const triggerHaptic = React.useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    motionAccessibilityManager.triggerHapticFeedback(type);
  }, []);

  return {
    ...preferences,
    updatePreferences,
    createAnimation,
    triggerHaptic,
  };
}

// ============================================================================
// Higher-Order Components
// ============================================================================

export function withMotionAccessibility<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const MotionAccessibleComponent = React.forwardRef<any, P>((props, ref) => {
    const motion = useMotionAccessibility();

    return React.createElement(Component, {
      ...props,
      ref,
      motionAccessibility: motion,
    });
  });

  MotionAccessibleComponent.displayName = `WithMotionAccessibility(${Component.displayName || Component.name})`;
  return MotionAccessibleComponent;
}

// ============================================================================
// Animation Presets
// ============================================================================

export const ACCESSIBLE_ANIMATION_PRESETS = {
  /** Quick, subtle animations */
  SUBTLE: {
    type: 'fade' as AnimationType,
    duration: 150,
    useNativeDriver: true,
    reducedMotionAlternative: 'none' as const,
  },

  /** Standard animations */
  STANDARD: {
    type: 'fade' as AnimationType,
    duration: 300,
    useNativeDriver: true,
    reducedMotionAlternative: 'fade' as const,
  },

  /** Emphatic animations */
  EMPHATIC: {
    type: 'spring' as AnimationType,
    duration: 400,
    useNativeDriver: true,
    reducedMotionAlternative: 'fade' as const,
  },

  /** Background animations */
  BACKGROUND: {
    type: 'parallax' as AnimationType,
    duration: 500,
    useNativeDriver: true,
    reducedMotionAlternative: 'none' as const,
  },
} as const;