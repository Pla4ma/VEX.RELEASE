/**
 * Text Helpers
 *
 * Helper functions for the Text component.
 */
import { Text } from './Text';
import type { TextProps, TextVariant } from './Text.types';

/**
 * Create a pre-configured Text variant component
 */
export function createTextVariant(
  variant: TextVariant,
  defaultProps?: Partial<TextProps>,
) {
  return function TextVariantComponent(props: TextProps): React.ReactNode {
    return <Text variant={variant} {...defaultProps} {...props} />;
  };
}
