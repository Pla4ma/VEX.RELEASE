import type { Theme } from '../../theme/types';
import type { SpacingValue } from './types';

const spacingTokenMap = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '8': 8,
  '10': 10,
  '12': 12,
  '16': 16,
  '20': 20,
  '24': 24,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
  '2xl': 8,
  '3xl': 12,
} as const;

interface ColorTree {
  [key: string]: string | ColorTree;
}

export function resolveSpacingValue(
  value: SpacingValue | undefined,
  theme: Theme,
): number | `${number}%` | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (value.endsWith('%')) {
    return value as `${number}%`;
  }
  const key = spacingTokenMap[value as keyof typeof spacingTokenMap];
  return key === undefined ? undefined : theme.spacing[key];
}

export function resolveColorValue(
  value: string | undefined,
  theme: Theme,
): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value.startsWith('#') || value.startsWith('rgb') || value === 'transparent') {
    return value;
  }
  const parts = value.split('.');
  // theme.colors is ColorPalette (typed), cast to ColorTree (indexable)
  let current: string | ColorTree = theme.colors as unknown as ColorTree;
  for (const part of parts) {
    if (typeof current === 'string') {
      return current;
    }
    const next: string | ColorTree | undefined = current[part];
    if (next === undefined) {
      return value;
    }
    current = next;
  }
  return typeof current === 'string' ? current : value;
}
