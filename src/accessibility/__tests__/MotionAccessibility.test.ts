import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  MotionAccessibilityManager,
  motionAccessibilityManager,
} from "../MotionAccessibility";
import { localStorageMock } from "./setup";

describe("MotionAccessibility", () => {
  let manager: MotionAccessibilityManager;
  beforeEach(() => {
    jest.clearAllMocks();
    manager = motionAccessibilityManager;
  });
  describe("Preference Management", () => {
    it("should get default motion preferences", () => {
      const preferences = manager.getPreferences();
      expect(preferences.reducedMotion).toBe(false);
      expect(preferences.animationDurationMultiplier).toBe(1.0);
      expect(preferences.parallaxEnabled).toBe(true);
      expect(preferences.springAnimationsEnabled).toBe(true);
    });
    it("should update motion preferences", () => {
      manager.setReducedMotion(true);
      manager.setAnimationDurationMultiplier(0.5);
      const preferences = manager.getPreferences();
      expect(preferences.reducedMotion).toBe(true);
      expect(preferences.animationDurationMultiplier).toBe(0.5);
    });
    it("should persist preferences to storage", () => {
      manager.setReducedMotion(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "vex_motion_preferences",
        expect.stringContaining("reducedMotion"),
      );
    });
  });
  describe("Animation Creation", () => {
    it("should create fade animation", () => {
      const animation = manager.createAnimation({
        type: "fade",
        duration: 300,
      });
      expect(animation).toBeDefined();
    });
    it("should create slide animation", () => {
      const animation = manager.createAnimation({
        type: "slide",
        duration: 200,
      });
      expect(animation).toBeDefined();
    });
    it("should create spring animation", () => {
      const animation = manager.createAnimation({
        type: "spring",
        duration: 400,
      });
      expect(animation).toBeDefined();
    });
    it("should adjust animation for reduced motion", () => {
      manager.setReducedMotion(true);
      const animation = manager.createAnimation({
        type: "slide",
        duration: 300,
        reducedMotionAlternative: "fade",
      });
      expect(animation).toBeDefined();
    });
    it("should apply animation duration multiplier", () => {
      manager.setAnimationDurationMultiplier(0.5);
      const animation = manager.createAnimation({
        type: "fade",
        duration: 400,
      });
      expect(animation).toBeDefined();
    });
  });
  describe("Motion Preferences Integration", () => {
    it("should determine if animation should run", () => {
      manager.setReducedMotion(false);
      expect(manager.shouldAnimate("fade")).toBe(true);
      expect(manager.shouldAnimate("parallax")).toBe(true);
      manager.setReducedMotion(true);
      expect(manager.shouldAnimate("fade")).toBe(true);
      expect(manager.shouldAnimate("parallax")).toBe(false);
    });
    it("should get adjusted animation duration", () => {
      manager.setAnimationDurationMultiplier(0.5);
      const adjustedDuration = manager.getAnimationDuration(400);
      expect(adjustedDuration).toBe(200);
    });
  });
  describe("Diagnostic Information", () => {
    it("should provide diagnostic info", () => {
      const diagnostics = manager.getDiagnosticInfo();
      expect(diagnostics).toHaveProperty("preferences");
      expect(diagnostics).toHaveProperty("activeAnimations");
      expect(diagnostics).toHaveProperty("registrySize");
    });
    it("should reset animations", () => {
      manager.resetAnimations();
      const diagnostics = manager.getDiagnosticInfo();
      expect(diagnostics.activeAnimations).toBe(0);
    });
  });
});
