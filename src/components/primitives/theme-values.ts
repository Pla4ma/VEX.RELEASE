import type { ThemeColors, ThemeSpacing } from './types';

export type { ThemeColors, ThemeSpacing } from './types';

export type ColorTree = ThemeColors & Record<string, unknown>;

export function resolveColorValue(value: unknown, theme: ThemeColors): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return theme.colors?.primary ?? theme.primary ?? undefined;
  return undefined;
}

export function resolveSpacingValue(value: unknown, theme: unknown): number | undefined {
  if (typeof value === 'number') return value;
  const spacing = (theme as { spacing?: ThemeSpacing } | null)?.spacing;
  if (typeof value === 'string' && spacing) {
    return spacing[value as keyof ThemeSpacing];
  }
  return undefined;
}

export function getThemeColor(colors: ThemeColors, path: string): string {
  const segments = path.split('.');
  let current: ColorTree = colors as ColorTree;
  for (const segment of segments) {
    const value = current[segment];
    if (typeof value === 'string') return value;
    if (typeof value !== 'object' || value === null) break;
    current = value as ColorTree;
  }
  return colors.primary ?? '#000000';
}
