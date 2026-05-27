/**
 * Border Radius Tokens
 *
 * Standardized border radius values for consistent component styling.
 */

import type { BorderRadiusScale } from "../types";

/**
 * Base border radius scale
 */
export const borderRadius: BorderRadiusScale = {
  none: 0,
  xs: 2,
  sm: 4,
  DEFAULT: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

/**
 * Component-specific border radius values
 */
export const componentBorderRadius = {
  // Buttons
  button: {
    sm: borderRadius.sm,
    DEFAULT: borderRadius.md,
    lg: borderRadius.lg,
    full: borderRadius.full,
  },

  // Inputs
  input: {
    DEFAULT: borderRadius.md,
    pill: borderRadius.full,
  },

  // Cards
  card: {
    sm: borderRadius.md,
    DEFAULT: borderRadius.lg,
    lg: borderRadius.xl,
  },

  // Modals/Sheets
  modal: {
    DEFAULT: borderRadius.xl,
    top: borderRadius["2xl"],
  },

  // Badges/Tags
  badge: {
    DEFAULT: borderRadius.sm,
    pill: borderRadius.full,
  },

  // Avatars
  avatar: {
    DEFAULT: borderRadius.full,
    rounded: borderRadius.lg,
    square: borderRadius.md,
  },
};
