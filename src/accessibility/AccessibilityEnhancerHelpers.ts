import React from "react";
import { Platform } from "react-native";
import {
  getAccessibleColor,
  getAccessibleAlternatives,
  checkContrast,
} from "./AccessibilitySystem";
import { createDebugger } from "../utils/debug";
import type {
  EnhancedAccessibilityProps,
  AccessibilityEnhancementConfig,
} from "./AccessibilityEnhancerTypes";

const debug = createDebugger("accessibility-enhancer");

export function getContrastEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>,
  config: AccessibilityEnhancementConfig,
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  if (
    "style" in props &&
    typeof props.style === "object" &&
    props.style !== null
  ) {
    const style = props.style as Record<string, string>;
    const color = typeof style.color === "string" ? style.color : undefined;
    const backgroundColor =
      typeof style.backgroundColor === "string"
        ? style.backgroundColor
        : undefined;
    if (color && backgroundColor) {
      const contrast = checkContrast(color, backgroundColor);
      if (!contrast.passesAA) {
        const alternatives = getAccessibleAlternatives(color, backgroundColor);
        if (alternatives.length > 0) {
          enhancements.style = { ...style, color: alternatives[0] };
          debug.info("Applied contrast enhancement:", {
            original: color,
            improved: alternatives[0],
            ratio: contrast.ratio,
          });
        }
      }
    }
    if (config.colorBlindSupport !== "none") {
      if (color) {
        enhancements.style = {
          ...style,
          color: getAccessibleColor("primary", config.colorBlindSupport),
        };
      }
      if (backgroundColor) {
        enhancements.style = {
          ...(enhancements.style || style),
          backgroundColor: getAccessibleColor(
            "secondary",
            config.colorBlindSupport,
          ),
        };
      }
    }
  }
  return enhancements;
}

export function getFocusEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>,
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  if (
    "onPress" in props ||
    "onSubmit" in props ||
    props.accessible === true
  ) {
    enhancements.accessibilityViewIsModal = false;
    enhancements.accessibilityElementsHidden = false;
    if (Platform.OS === "ios") {
      enhancements.accessibilityRole =
        (props as EnhancedAccessibilityProps).accessibilityRole || "button";
    }
  }
  return enhancements;
}

export function getMotionEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>,
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  if ("animated" in props || "useNativeDriver" in props) {
    enhancements.accessibilityReduceMotion = true;
    enhancements.accessibilityIgnoresPageScaling = false;
  }
  return enhancements;
}

export function getScreenReaderEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>,
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  if (props.accessible !== false) {
    if (
      !props.accessibilityLabel &&
      ("title" in props || "children" in props)
    ) {
      const children = (props as { children?: React.ReactNode }).children;
      const title = (props as { title?: string }).title;
      enhancements.accessibilityLabel = generateAccessibilityLabel({
        children,
        title,
        props,
      });
    }
    if (!props.accessibilityRole) {
      enhancements.accessibilityRole = inferSemanticRole(props);
    }
    if (!props.accessibilityHint && "onPress" in props) {
      enhancements.accessibilityHint = generateAccessibilityHint(props);
    }
  }
  return enhancements;
}

function generateAccessibilityLabel(options: {
  children?: React.ReactNode;
  title?: string;
  props: Record<string, unknown>;
}): string {
  const { children, title, props } = options;
  if (title) {
    return title;
  }
  if (children && typeof children === "string") {
    return children;
  }
  if (typeof props.placeholder === "string") {
    return props.placeholder;
  }
  if (typeof props.value === "string") {
    return props.value;
  }
  return "Interactive element";
}

function generateAccessibilityHint(props: Record<string, unknown>): string {
  if (props.onPress) {
    return "Activates this control";
  }
  if (props.onLongPress) {
    return "Long press activates this control";
  }
  if (props.onValueChange) {
    return "Adjusts this setting";
  }
  if (props.onChangeText) {
    return "Text input field";
  }
  return "Interactive control";
}

function inferSemanticRole(props: Record<string, unknown>): string {
  if (props.onPress) {
    return "button";
  }
  if (props.onChangeText || props.value !== undefined) {
    return "textbox";
  }
  if (props.onValueChange) {
    if (props.value === true || props.value === false) {
      return "switch";
    }
    return "slider";
  }
  if (props.selected !== undefined) {
    return "radio";
  }
  return "generic";
}
