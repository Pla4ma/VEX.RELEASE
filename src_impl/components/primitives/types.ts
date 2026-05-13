/**
 * Primitive Component Types
 *
 * Shared types for primitive components.
 */

import type { ViewStyle } from 'react-native';

/**
 * Spacing value - can be theme token key or number
 */
export type SpacingValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number | `${number}%`;

/**
 * Color value - can be theme token or color string
 */
export type ColorValue = string;

/**
 * Responsive value
 */
export type ResponsiveValue<T> = T | { [key: string]: T };

export * from "./types.types";
