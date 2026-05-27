/**
 * useAccessibility Hook
 *
 * Accessibility helpers for screen readers and focus management.
 */

import { useCallback } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Accessibility hook return type
 */
interface UseAccessibilityReturn {
  /** Check if screen reader is enabled */
  isScreenReaderEnabled: () => Promise<boolean>;

  /** Announce message to screen reader */
  announce: (message: string) => void;

  /** Set accessibility focus */
  setFocus: (reactTag: number) => void;
}

/**
 * Hook for accessibility features
 */
export function useAccessibility(): UseAccessibilityReturn {
  /**
   * Check if screen reader is enabled
   */
  const isScreenReaderEnabled = useCallback(async (): Promise<boolean> => {
    return AccessibilityInfo.isScreenReaderEnabled();
  }, []);

  /**
   * Announce message to screen reader
   */
  const announce = useCallback((message: string): void => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  /**
   * Set accessibility focus
   */
  const setFocus = useCallback((reactTag: number): void => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  }, []);

  return {
    isScreenReaderEnabled,
    announce,
    setFocus,
  };
}

/**
 * Generate accessibility props for a button
 */
export function getButtonAccessibilityProps(
  label: string,
  hint?: string,
  disabled?: boolean,
): {
  accessible: boolean;
  accessibilityRole: "button";
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean };
} {
  return {
    accessible: true,
    accessibilityRole: "button",
    accessibilityLabel: label,
    ...(hint && { accessibilityHint: hint }),
    accessibilityState: { disabled: disabled ?? false },
  };
}

/**
 * Generate accessibility props for a link
 */
export function getLinkAccessibilityProps(
  label: string,
  hint?: string,
): {
  accessible: boolean;
  accessibilityRole: "link";
  accessibilityLabel: string;
  accessibilityHint?: string;
} {
  return {
    accessible: true,
    accessibilityRole: "link",
    accessibilityLabel: label,
    ...(hint && { accessibilityHint: hint }),
  };
}

/**
 * Generate accessibility props for a header
 */
export function getHeaderAccessibilityProps(level: 1 | 2 | 3 | 4): {
  accessible: boolean;
  accessibilityRole: "header";
  accessibilityLevel: number;
} {
  return {
    accessible: true,
    accessibilityRole: "header",
    accessibilityLevel: level,
  };
}
