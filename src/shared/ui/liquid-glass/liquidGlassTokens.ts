import { borderRadius, spacing } from '../../../theme/tokens/radius';

export const liquidGlassRadii = {
  card: borderRadius['2xl'],
  sheet: borderRadius['3xl'],
  pill: borderRadius.full,
} as const;

export const liquidGlassSpacing = {
  screenX: spacing[6],
  screenTop: spacing[6],
  screenBottom: spacing[8],
  card: spacing[6],
  cardCompact: spacing[4],
  section: spacing[6],
  hairlineInset: spacing[3],
} as const;

export const liquidGlassAssetSize = {
  sm: 44,
  md: 64,
  lg: 88,
} as const;
