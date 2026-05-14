import React from 'react';
import { Platform } from 'react-native';
import { 
  getAccessibleColor, 
  getAccessibleAlternatives, 
  checkContrast 
} from './AccessibilitySystem';
import { 
  type EnhancedAccessibilityProps, 
  type AccessibilityEnhancementConfig 
} from './AccessibilityEnhancer.types';
import { 
  generateAccessibilityLabel, 
  generateAccessibilityHint, 
  inferSemanticRole 
} from './AccessibilityEnhancer.utils';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('accessibility-enhancer-logic');

export function getContrastEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>,
  config: AccessibilityEnhancementConfig
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};

  if ('style' in props && typeof props.style === 'object' && props.style !== null) {
    const style = props.style as Record<string, string>;
    const color = typeof style['color'] === 'string' ? style['color'] : undefined;
    const backgroundColor = typeof style['backgroundColor'] === 'string' ? style['backgroundColor'] : undefined;

    if (color && backgroundColor) {
      const contrast = checkContrast(color, backgroundColor);

      if (!contrast.passesAA) {
        const alternatives = getAccessibleAlternatives(color, backgroundColor);

        if (alternatives.length > 0) {
          enhancements.style = {
            ...style,
            color: alternatives[0],
          };

          debug.info('Applied contrast enhancement:', {
            original: color,
            improved: alternatives[0],
            ratio: contrast.ratio,
          });
        }
      }
    }

    if (config.colorBlindSupport !== 'none') {
      if (color) {
        enhancements.style = {
          ...(enhancements.style as object || style),
          color: getAccessibleColor('primary', config.colorBlindSupport),
        };
      }
      if (backgroundColor) {
        enhancements.style = {
          ...(enhancements.style as object || style),
          backgroundColor: getAccessibleColor('secondary', config.colorBlindSupport),
        };
      }
    }
  }

  return enhancements;
}

export function getFocusEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};

  if ('onPress' in props || 'onSubmit' in props || props.accessible === true) {
    enhancements.accessibilityViewIsModal = false;
    enhancements.accessibilityElementsHidden = false;
    
    if (Platform.OS === 'ios') {
      enhancements.accessibilityRole = (props.accessibilityRole) || 'button';
    }
  }

  return enhancements;
}

export function getMotionEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};

  if ('animated' in props || 'useNativeDriver' in props) {
    enhancements.accessibilityReduceMotion = true;
    enhancements.accessibilityIgnoresPageScaling = false;
  }

  return enhancements;
}

export function getScreenReaderEnhancements<P extends object>(
  props: P & Partial<EnhancedAccessibilityProps>
): Partial<EnhancedAccessibilityProps> {
  const enhancements: Partial<EnhancedAccessibilityProps> = {};

  if (props.accessible !== false) {
    if (!props.accessibilityLabel && ('title' in props || 'children' in props)) {
      const children = (props as { children?: React.ReactNode }).children;
      const title = (props as { title?: string }).title;
      
      enhancements.accessibilityLabel = generateAccessibilityLabel({
        children,
        title,
        props: props as Record<string, unknown>,
      });
    }

    if (!props.accessibilityRole) {
      enhancements.accessibilityRole = inferSemanticRole(props as Record<string, unknown>);
    }

    if (!props.accessibilityHint && ('onPress' in props)) {
      enhancements.accessibilityHint = generateAccessibilityHint(props as Record<string, unknown>);
    }
  }

  return enhancements;
}
