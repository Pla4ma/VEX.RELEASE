/**
 * Primitive Components Export
 *
 * Building blocks for all UI components.
 */

export { Box } from './Box';
export type { BoxProps } from './BoxProps';

export { Text } from './Text';
export type { TextProps, TextVariant } from './Text.types';

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Card } from './Card';
export { CardFooter, CardHeader } from './CardSubcomponents';
export type { CardProps, CardVariant, CardSize, CardState } from './Card';

export { AppScreen } from './AppScreen';
export { PremiumBackdrop } from './PremiumBackdrop';

export { Stack } from './Stack';
export { VStack } from './VStack';
export { HStack } from './HStack';
export { Center } from './Center';
export type { StackProps } from './Stack';

export { FeatureScreen } from './FeatureScreen';

export { VexMotionSurface } from './VexMotionSurface';
export type { VexMotionSurfaceProps } from './VexMotionSurface';

export { VexLaunchButton } from './VexLaunchButton';
export type { VexLaunchButtonProps } from './VexLaunchButton';
export {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonChart,
} from '@/shared/ui/primitives';

export type {
  SpacingValue,
  ColorValue,
  ResponsiveValue,
  CommonPrimitiveProps,
  BoxStyleProps,
  LayoutProps,
  FlexProps,
  SpacingProps,
  PositionProps,
} from './types';
