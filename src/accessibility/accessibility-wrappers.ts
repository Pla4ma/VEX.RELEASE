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
  const [enhancedProps, setEnhancedProps] =
    React.useState<EnhancedAccessibilityProps>({});
  React.useEffect(() => {
    const enhanced = accessibilityEnhancer.enhanceProps(
      baseProps,
      customEnhancements,
    );
    setEnhancedProps(enhanced);
  }, [baseProps, customEnhancements]);
  return enhancedProps;
}
