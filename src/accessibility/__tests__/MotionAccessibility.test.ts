import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  MotionAccessibilityManager,
  motionAccessibilityManager,
} from '../MotionAccessibility';

describe('MotionAccessibility', () => {
  let manager: MotionAccessibilityManager;
  beforeEach(() => {
    jest.clearAllMocks();
    manager = motionAccessibilityManager;
  });
  describe('Preference Management', () => {
    it('should get default motion preferences', () => {
      const preferences = manager.getPreferences();
      expect(preferences.reducedMotion).toBe(false);
      expect(preferences.animationDurationMultiplier).toBe(1.0);
      expect(preferences.parallaxEnabled).toBe(true);
      expect(preferences.springAnimationsEnabled).toBe(true);
    });
    it('should update motion preferences', () => {
      manager.setReducedMotion(true);
      manager.setAnimationDurationMultiplier(0.5);
      const preferences = manager.getPreferences();
      expect(preferences.reducedMotion).toBe(true);
      expect(preferences.animationDurationMultiplier).toBe(0.5);
    });
    it('should update preferences via updatePreferences', () => {
      manager.updatePreferences({
        reducedMotion: true,
        parallaxEnabled: false,
      });
      const preferences = manager.getPreferences();
      expect(preferences.reducedMotion).toBe(true);
      expect(preferences.parallaxEnabled).toBe(false);
    });
    it('should enable and disable parallax', () => {
      manager.enableParallax(false);
      expect(manager.getPreferences().parallaxEnabled).toBe(false);
      manager.enableParallax(true);
      expect(manager.getPreferences().parallaxEnabled).toBe(true);
    });
    it('should enable and disable haptic feedback', () => {
      manager.enableHapticFeedback(false);
      expect(manager.getPreferences().hapticFeedbackEnabled).toBe(false);
      manager.enableHapticFeedback(true);
      expect(manager.getPreferences().hapticFeedbackEnabled).toBe(true);
    });
    it('should clamp animation duration multiplier to minimum 0.1', () => {
      manager.setAnimationDurationMultiplier(0.05);
      expect(manager.getPreferences().animationDurationMultiplier).toBe(0.1);
    });
  });
  describe('Animation Creation', () => {
    it('should create fade animation', () => {
      const animation = manager.createAnimation({
        type: 'fade',
        duration: 300,
      });
      expect(animation).toBeDefined();
      expect(animation).toHaveProperty('start');
      expect(animation).toHaveProperty('stop');
      expect(animation).toHaveProperty('reset');
    });
    it('should create slide animation', () => {
      const animation = manager.createAnimation({
        type: 'slide',
        duration: 200,
      });
      expect(animation).toBeDefined();
    });
    it('should create spring animation', () => {
      const animation = manager.createAnimation({
        type: 'spring',
        duration: 400,
      });
      expect(animation).toBeDefined();
    });
    it('should adjust animation for reduced motion', () => {
      manager.setReducedMotion(true);
      const animation = manager.createAnimation({
        type: 'slide',
        duration: 300,
        reducedMotionAlternative: 'fade',
      });
      expect(animation).toBeDefined();
    });
    it('should apply animation duration multiplier', () => {
      manager.setAnimationDurationMultiplier(0.5);
      const animation = manager.createAnimation({
        type: 'fade',
        duration: 400,
      });
      expect(animation).toBeDefined();
    });
  });
  describe('Animated Value Creation', () => {
    it('should create an animated value', () => {
      const value = manager.createAnimatedValue(10);
      expect(value).toBeDefined();
      expect(value).toHaveProperty('setValue');
      expect(value).toHaveProperty('stopAnimation');
    });
    it('should register animated value with a key', () => {
      const value = manager.createAnimatedValue(0, 'myAnimation');
      expect(value).toBeDefined();
      const stats = manager.getPerformanceStats();
      expect(stats.totalAnimations).toBeGreaterThanOrEqual(1);
    });
  });
  describe('Performance Stats', () => {
    it('should provide performance stats', () => {
      const stats = manager.getPerformanceStats();
      expect(stats).toHaveProperty('totalAnimations');
      expect(stats).toHaveProperty('activeAnimations');
      expect(stats).toHaveProperty('averageDuration');
      expect(stats).toHaveProperty('reducedMotionUsage');
    });
    it('should reflect reduced motion in stats', () => {
      manager.setReducedMotion(true);
      const stats = manager.getPerformanceStats();
      expect(stats.reducedMotionUsage).toBe(1);
      manager.setReducedMotion(false);
      const stats2 = manager.getPerformanceStats();
      expect(stats2.reducedMotionUsage).toBe(0);
    });
  });
  describe('Listeners', () => {
    it('should notify listeners on preference changes', () => {
      const listener = jest.fn();
      const unsubscribe = manager.addListener(listener);
      manager.setReducedMotion(true);
      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });
    it('should unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = manager.addListener(listener);
      unsubscribe();
      manager.setReducedMotion(true);
      expect(listener).not.toHaveBeenCalled();
    });
    it('should remove all listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      manager.addListener(listener1);
      manager.addListener(listener2);
      manager.removeAllListeners();
      manager.setReducedMotion(true);
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
  describe('System Preferences Detection', () => {
    it('should detect system motion preferences', async () => {
      const result = await manager.detectSystemMotionPreferences();
      expect(result).toHaveProperty('reducedMotion');
      expect(typeof result.reducedMotion).toBe('boolean');
    });
  });
  describe('Safe Animation', () => {
    it('should create a safe animation from a function', () => {
      const animation = manager.createSafeAnimation(() =>
        manager.createAnimation({ type: 'fade', duration: 300 }),
      );
      expect(animation).toBeDefined();
      expect(animation).toHaveProperty('start');
    });
    it('should use fallback when animation creation throws', () => {
      const fallback = jest.fn();
      const animation = manager.createSafeAnimation(() => {
        throw new Error('animation failed');
      }, fallback);
      expect(animation).toBeDefined();
      expect(fallback).toHaveBeenCalled();
    });
  });
});
