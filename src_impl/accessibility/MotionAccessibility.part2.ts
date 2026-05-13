import React from "react";
import { Animated, Easing } from "react-native";
import { createDebugger } from "../utils/debug";


export const motionAccessibilityManager = MotionAccessibilityManager.getInstance();

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