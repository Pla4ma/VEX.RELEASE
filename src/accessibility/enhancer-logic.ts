/**
 * Accessibility Enhancement Logic
 *
 * Automatic enhancement logic for accessibility improvements.
 */

import { createDebugger } from '../utils/debug';
import { getAccessibleColor, getAccessibleAlternatives, checkContrast } from './AccessibilitySystem';
import type { ColorBlindType } from './types';
import type { EnhancedAccessibilityProps, AccessibilityEnhancementConfig } from './enhancer-types';

const debug = createDebugger('accessibility-enhancer');

interface PropsWithStyle {
  style?: { color?: string; backgroundColor?: string; [key: string]: unknown };
  title?: unknown;
  children?: unknown;
  onPress?: unknown;
  onLongPress?: unknown;
  animated?: unknown;
  useNativeDriver?: unknown;
  accessibilityRole?: unknown;
  accessibilityHint?: unknown;
  accessible?: unknown;
}

export function getAutomaticEnhancements(
  props: unknown,
  config: AccessibilityEnhancementConfig
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};

  if (config.autoContrastFixes) {
    Object.assign(enhancements, getContrastEnhancements(props, config.colorBlindSupport));
  }
  if (config.autoFocusManagement) {
    Object.assign(enhancements, getFocusEnhancements(props));
  }
  if (config.motionOptimizations) {
    Object.assign(enhancements, getMotionEnhancements(props));
  }
  if (config.screenReaderOptimizations) {
    Object.assign(enhancements, getScreenReaderEnhancements(props));
  }

  return enhancements;
}

function getContrastEnhancements(props: unknown, colorBlindSupport: ColorBlindType): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  const sourceProps = props as PropsWithStyle;
  const style = sourceProps?.style;

  if (style && typeof style === 'object' && !Array.isArray(style)) {
    const styleColor = typeof style.color === 'string' ? style.color : undefined;
    const styleBackground = typeof style.backgroundColor === 'string' ? style.backgroundColor : undefined;

    if (styleColor && styleBackground) {
      const contrast = checkContrast(styleColor, styleBackground);
      if (!contrast.passesAA) {
        const alternatives = getAccessibleAlternatives(styleColor, styleBackground);
        if (alternatives.length > 0) {
          enhancements.style = { ...style, color: alternatives[0] };
          debug.info('Applied contrast enhancement:', { original: styleColor, improved: alternatives[0], ratio: contrast.ratio });
        }
      }
    }

    if (colorBlindSupport !== 'none') {
      if (styleColor) {
        enhancements.style = { ...(enhancements.style ?? style), color: getAccessibleColor('primary', colorBlindSupport) };
      }
      if (styleBackground) {
        enhancements.style = { ...(enhancements.style ?? style), backgroundColor: getAccessibleColor('secondary', colorBlindSupport) };
      }
    }
  }

  return enhancements;
}

function getFocusEnhancements(props: unknown): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  const sourceProps = props as PropsWithStyle;

  if ('onPress' in sourceProps || 'onLongPress' in sourceProps) {
    if (!('accessible' in sourceProps)) { enhancements.accessible = true; }
    if (!('accessibilityRole' in sourceProps)) { enhancements.accessibilityRole = 'button'; }
  }

  if ('onPress' in sourceProps && !('accessibilityHint' in sourceProps)) {
    enhancements.accessibilityHint = 'Double tap to activate';
  }

  return enhancements;
}

function getMotionEnhancements(props: unknown): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  const sourceProps = props as PropsWithStyle;

  if ('animated' in sourceProps || 'useNativeDriver' in sourceProps) {
    enhancements.accessibilityReduceMotion = true;
  }

  return enhancements;
}

function getScreenReaderEnhancements(props: unknown): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};
  const sourceProps = props as PropsWithStyle;

  if ('title' in sourceProps && !('accessibilityRole' in sourceProps)) {
    const title = typeof sourceProps.title === 'string' ? sourceProps.title : undefined;
    if (title) {
      enhancements.accessibilityRole = 'header';
      enhancements.accessibilityLabel = title;
    }
  }

  if ('children' in sourceProps) {
    const children = sourceProps.children;
    if (typeof children === 'string' && (children.includes('Loading') || children.includes('Error'))) {
      enhancements.accessibilityLiveRegion = 'polite';
    }
  }

  return enhancements;
}

export function applyEnhancements(
  props: Record<string, unknown>,
  automaticEnhancements: Record<string, unknown>,
  manualEnhancements?: Partial<EnhancedAccessibilityProps>
): Record<string, unknown> {
  const allEnhancements = { ...automaticEnhancements, ...manualEnhancements };

  if (Object.keys(allEnhancements).length > 0) {
    debug.debug('Applied accessibility enhancements:', { props, enhancements: allEnhancements });
  }

  return { ...props, ...allEnhancements };
}
