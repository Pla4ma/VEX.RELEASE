/**
 * Box Helpers
 *
 * Helper functions for the Box component.
 */
import type { BoxProps } from './BoxProps';
import { Box } from './Box';

/**
 * Create a specialized Box variant
 */
export function createBox(defaultProps: Partial<BoxProps>) {
  return function BoxVariant(props: BoxProps): React.ReactNode {
    return <Box {...defaultProps} {...props} />;
  };
}
