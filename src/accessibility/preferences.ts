/**
 * Accessibility Preferences Management
 *
 * User preference storage and retrieval
 */

import { AccessibilityPreferences } from "./types";
import { DEFAULT_ACCESSIBILITY } from "./constants";

let currentPreferences: AccessibilityPreferences = { ...DEFAULT_ACCESSIBILITY };

/**
 * Get current accessibility preferences
 */
export function getAccessibilityPreferences(): AccessibilityPreferences {
  return { ...currentPreferences };
}

/**
 * Update accessibility preferences
 */
export function updateAccessibilityPreferences(
  updates: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  currentPreferences = {
    ...currentPreferences,
    ...updates,
  };

  // Emit preference change event
  if (typeof window !== "undefined" && window.dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent("accessibilityPreferencesChanged", {
        detail: currentPreferences,
      }),
    );
  }

  return { ...currentPreferences };
}

/**
 * Reset accessibility preferences to defaults
 */
export function resetAccessibilityPreferences(): AccessibilityPreferences {
  currentPreferences = { ...DEFAULT_ACCESSIBILITY };
  return { ...currentPreferences };
}

/**
 * Detect system accessibility settings
 */
export async function detectSystemAccessibility(): Promise<
  Partial<AccessibilityPreferences>
> {
  const detected: Partial<AccessibilityPreferences> = {};

  try {
    // Detect reduced motion preference
    if (typeof window !== "undefined" && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        detected.reducedMotion = true;
        detected.animationsEnabled = false;
      }
    }

    // Detect high contrast preference
    if (typeof window !== "undefined" && window.matchMedia) {
      const prefersHighContrast = window.matchMedia(
        "(prefers-contrast: high)",
      ).matches;
      if (prefersHighContrast) {
        detected.highContrast = true;
      }
    }
  } catch (error) {
    // Failed to detect system accessibility settings
    // Would integrate with proper error handling/logging
  }

  return detected;
}
