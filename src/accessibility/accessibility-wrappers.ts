import React from 'react';
import { accessibilityEnhancer } from './AccessibilityEnhancer';
import type { EnhancedAccessibilityProps } from './enhancer-types';

export function enhanceComponent<P extends object>(
  Component: React.ComponentType<P>,
  enhancements?: Partial<EnhancedAccessibilityProps>,
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
> {
  return accessibilityEnhancer.enhanceComponent(Component, enhancements);
}
export function enhanceProps<P extends object>(
  props: P,
  enhancements?: Partial<EnhancedAccessibilityProps>,
): P & EnhancedAccessibilityProps {
  return accessibilityEnhancer.enhanceProps(props, enhancements);
}
export function withAccessibility<P extends object>(
  enhancements?: Partial<EnhancedAccessibilityProps>,
) {
  return function (
    Component: React.ComponentType<P>,
  ): React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<unknown>
  > {
    return accessibilityEnhancer.enhanceComponent(Component, enhancements);
  };
}
export function useAccessibilityEnhancements(
  baseProps: Record<string, unknown>,
  customEnhancements?: Partial<EnhancedAccessibilityProps>,
): EnhancedAccessibilityProps {
  return React.useMemo(
    () => accessibilityEnhancer.enhanceProps(baseProps, customEnhancements),
    [baseProps, customEnhancements],
  );
}
