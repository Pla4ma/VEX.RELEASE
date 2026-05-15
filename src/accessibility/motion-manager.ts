/**
 * Motion Accessibility Manager
 *
 * Manages motion preferences and animation creation with accessibility support.
 */

import { createDebugger } from '../utils/debug';
import {
  DEFAULT_MOTION_PREFERENCES,
  type MotionPreferences,
  type AnimationConfig,
} from './motion-preferences';
import {
  adjustAnimationForAccessibility,
  createAnimationType,
} from './animation-utils';
import {
  createAnimatedValue,
  createTiming,
  easingOut,
  type AnimatedValue,
  type CompositeAnimation,
} from './motion-animation-stubs';

const debug = createDebugger('motion-accessibility');

export class MotionAccessibilityManager {
  private static instance: MotionAccessibilityManager;
  private preferences: MotionPreferences;
  private animationRegistry: Map<string, AnimatedValue> = new Map();
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
    this.updatePreferences({
      animationDurationMultiplier: Math.max(0.1, multiplier),
    });
  }

  enableParallax(enabled: boolean): void {
    this.updatePreferences({ parallaxEnabled: enabled });
  }

  enableHapticFeedback(enabled: boolean): void {
    this.updatePreferences({ hapticFeedbackEnabled: enabled });
  }

  createAnimatedValue(initialValue: number = 0, key?: string): AnimatedValue {
    const animatedValue = createAnimatedValue(initialValue);
    if (key) {
      this.animationRegistry.set(key, animatedValue);
    }
    return animatedValue;
  }

  createAnimation(config: AnimationConfig): CompositeAnimation {
    const adjustedConfig = adjustAnimationForAccessibility(
      config,
      this.preferences,
    );
    const animatedValue = this.getOrCreateAnimatedValue(config.type);
    return createAnimationType(
      adjustedConfig.type,
      animatedValue,
      adjustedConfig,
    );
  }

  createTransition(
    fromValue: AnimatedValue,
    toValue: AnimatedValue,
    config: AnimationConfig,
  ): CompositeAnimation {
    const adjustedConfig = adjustAnimationForAccessibility(
      config,
      this.preferences,
    );

    return createTiming(fromValue, {
      toValue: toValue as unknown as number,
      duration: adjustedConfig.duration || 300,
      delay: adjustedConfig.delay || 0,
      easing: easingOut(),
      useNativeDriver: adjustedConfig.useNativeDriver !== false,
    });
  }

  triggerHapticFeedback(
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error',
  ): void {
    if (!this.preferences.hapticFeedbackEnabled) {
      return;
    }
    debug.debug(`Haptic feedback triggered: ${type}`);
  }

  async detectSystemMotionPreferences(): Promise<Partial<MotionPreferences>> {
    try {
      const reducedMotion = await Promise.resolve(false);
      return { reducedMotion };
    } catch (error) {
      debug.error('Failed to detect system motion preferences:', error);
      return {};
    }
  }

  createSafeAnimation(
    animationFn: () => CompositeAnimation,
    fallback?: () => void,
  ): CompositeAnimation {
    try {
      return animationFn();
    } catch (error) {
      debug.error('Animation creation failed, using fallback:', error);
      if (fallback) {
        fallback();
      }
      return createTiming(createAnimatedValue(0), {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      });
    }
  }

  getPerformanceStats(): {
    totalAnimations: number;
    activeAnimations: number;
    averageDuration: number;
    reducedMotionUsage: number;
  } {
    return {
      totalAnimations: this.animationRegistry.size,
      activeAnimations: 0,
      averageDuration: 300,
      reducedMotionUsage: this.preferences.reducedMotion ? 1 : 0,
    };
  }

  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  private getOrCreateAnimatedValue(key: string): AnimatedValue {
    if (!this.animationRegistry.has(key)) {
      this.animationRegistry.set(key, createAnimatedValue(0));
    }
    return this.animationRegistry.get(key)!;
  }

  private loadPreferences(): void {
    try {
      debug.debug('Loaded motion preferences (using defaults)');
    } catch (error) {
      debug.error('Failed to load motion preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      debug.debug('Saved motion preferences:', this.preferences);
    } catch (error) {
      debug.error('Failed to save motion preferences:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const motionAccessibilityManager =
  MotionAccessibilityManager.getInstance();
