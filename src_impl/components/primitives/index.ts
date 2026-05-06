/**
 * Primitive Components Export
 *
 * Building blocks for all UI components.
 */

export { Box, createBox } from './Box';
export type { BoxProps } from './Box';

export { Text, createTextVariant } from './Text';
export type { TextProps, TextVariant } from './Text';

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Card } from './Card';
export type { CardProps, CardVariant, CardSize, CardState } from './Card';

export { Stack, VStack, HStack, Center } from './Stack';
export type { StackProps } from './Stack';

export { FeatureScreen } from './FeatureScreen';
export { Skeleton, SkeletonCard, SkeletonList, SkeletonChart } from '@/shared/ui/primitives';

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
