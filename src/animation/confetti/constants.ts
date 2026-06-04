import { lightColors } from '@/theme/tokens/colors';
/**
 * Confetti Constants
 *
 * Constants and configuration for confetti celebration.
 */

export const CONFETTI_COLORS = [
  lightColors.semantic.danger,
  lightColors.accent.teal,
  // TODO(P2-1): map remaining hex colors to theme tokens
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
];

export const PARTICLE_SHAPES = ['circle', 'square', 'triangle'] as const;

export const DEFAULT_PARTICLE_COUNT = 50;
export const DEFAULT_DURATION = 3000;
export const GRAVITY = 0.5;
export const FRICTION = 0.98;

export const particleStyle = { position: 'absolute' as const };

export const shapeStyle = {
  shadowColor: lightColors.text.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
};

export const triangleStyle = {
  width: 0,
  height: 0,
  backgroundColor: 'transparent' as const,
  borderStyle: 'solid' as const,
  borderLeftColor: 'transparent' as const,
  borderRightColor: 'transparent' as const,
  shadowColor: lightColors.text.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
};
