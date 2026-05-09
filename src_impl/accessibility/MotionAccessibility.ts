/**
 * Motion Accessibility System
 * 
 * Ensures animations and transitions respect user preferences
 * and provide alternatives for users with vestibular disorders.
 */

import React from 'react';
import { Animated, Platform } from 'react-native';
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
            easing: adjustedConfig.easing || Easing.out(Easing.quad),
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
            easing: adjustedConfig.easing || Easing.out(Easing.quad),
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
            easing: adjustedConfig.easing || Easing.out(Easing.quad),
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
            easing: adjustedConfig.easing || Easing.out(Easing.quad),
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
      easing: adjustedConfig.easing || Easing.out(Easing.quad),
      useNativeDriver: adjustedConfig.useNativeDriver || true,
    });
  }

  // ============================================================================
  // Accessibility Adjustments
  // ============================================================================

  private adjustAnimationForAccessibility(config: AnimationConfig): AnimationConfig {
    let adjustedConfig = { ...config };

    // Apply reduced motion preferences
    if (this.preferences.reducedMotion) {
      adjustedConfig = this.applyReducedMotion(adjustedConfig);
    }

    // Apply animation duration multiplier
    adjustedConfig.duration = Math.max(
      50, // Minimum 50ms for visibility
      adjustedConfig.duration * this.preferences.animationDurationMultiplier
    );

    return adjustedConfig;
  }

  private applyReducedMotion(config: AnimationConfig): AnimationConfig {
    const adjustedConfig = { ...config };

    switch (config.reducedMotionAlternative || 'fade') {
      case 'none':
        adjustedConfig.duration = 0;
        break;

      case 'instant':
        adjustedConfig.duration = 50; // Very fast, but still visible
        break;

      case 'fade':
      default:
        // Use fade animation instead of complex animations
        adjustedConfig.type = 'fade';
        adjustedConfig.duration = Math.min(config.duration, 200); // Max 200ms for reduced motion
        break;
    }

    return adjustedConfig;
  }

  // ============================================================================
  // React Hook Integration
  // ============================================================================

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // ============================================================================
  // Preference Persistence
  // ============================================================================

  private loadPreferences(): void {
    try {
      // In production, this would load from secure storage
      const stored = localStorage.getItem('vex_motion_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...DEFAULT_MOTION_PREFERENCES, ...parsed };
        debug.info('Motion preferences loaded from storage');
      }
    } catch (error) {
      debug.warn('Failed to load motion preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      // In production, this would save to secure storage
      localStorage.setItem('vex_motion_preferences', JSON.stringify(this.preferences));
      debug.info('Motion preferences saved to storage');
    } catch (error) {
      debug.warn('Failed to save motion preferences:', error);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  shouldAnimate(type: AnimationType): boolean {
    if (this.preferences.reducedMotion) {
      // Only allow fade animations when reduced motion is enabled
      return type === 'fade';
    }

    switch (type) {
      case 'parallax':
        return this.preferences.parallaxEnabled;
      case 'spring':
        return this.preferences.springAnimationsEnabled;
      case 'transition':
        return this.preferences.transitionAnimationsEnabled;
      default:
        return true;
    }
  }

  getAnimationDuration(baseDuration: number): number {
    return baseDuration * this.preferences.animationDurationMultiplier;
  }

  resetAnimations(): void {
    this.animationRegistry.forEach((animatedValue, key) => {
      animatedValue.setValue(0);
    });
    debug.info('All animations reset');
  }

  getDiagnosticInfo(): {
    preferences: MotionPreferences;
    activeAnimations: number;
    registrySize: number;
  } {
    return {
      preferences: this.preferences,
      activeAnimations: this.animationRegistry.size,
      registrySize: this.animationRegistry.size,
    };
  }

  private getOrCreateAnimatedValue(key: string): Animated.Value {
    if (!this.animationRegistry.has(key)) {
      this.animationRegistry.set(key, new Animated.Value(0));
    }
    return this.animationRegistry.get(key)!;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  cleanup(): void {
    this.animationRegistry.clear();
    this.listeners.clear();
    debug.info('Motion accessibility manager cleaned up');
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const motionAccessibilityManager = MotionAccessibilityManager.getInstance();

// ============================================================================
// React Hook for Motion Accessibility
// ============================================================================

export function useMotionAccessibility() {
  const [preferences, setPreferences] = React.useState<MotionPreferences>(
    motionAccessibilityManager.getPreferences()
  );

  React.useEffect(() => {
    const unsubscribe = motionAccessibilityManager.subscribe(() => {
      setPreferences(motionAccessibilityManager.getPreferences());
    });

    return unsubscribe;
  }, []);

  return {
    preferences,
    setReducedMotion: motionAccessibilityManager.setReducedMotion.bind(motionAccessibilityManager),
    setAnimationDurationMultiplier: motionAccessibilityManager.setAnimationDurationMultiplier.bind(motionAccessibilityManager),
    enableParallax: motionAccessibilityManager.enableParallax.bind(motionAccessibilityManager),
    enableHapticFeedback: motionAccessibilityManager.enableHapticFeedback.bind(motionAccessibilityManager),
    createAnimation: motionAccessibilityManager.createAnimation.bind(motionAccessibilityManager),
    createTransition: motionAccessibilityManager.createTransition.bind(motionAccessibilityManager),
    shouldAnimate: motionAccessibilityManager.shouldAnimate.bind(motionAccessibilityManager),
    getAnimationDuration: motionAccessibilityManager.getAnimationDuration.bind(motionAccessibilityManager),
    resetAnimations: motionAccessibilityManager.resetAnimations.bind(motionAccessibilityManager),
    getDiagnostics: motionAccessibilityManager.getDiagnosticInfo.bind(motionAccessibilityManager),
  };
}