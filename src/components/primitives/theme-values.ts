export type ThemeColors = { [key: string]: unknown };
export type ThemeSpacing = Record<string, number>;

export type ColorTree = { colors?: ThemeColors } & ThemeColors;

export function resolveColorValue(value: unknown, theme: unknown): string | undefined {
  if (typeof value === 'string') {return value;}
  if (typeof value === 'number') {
    const themeObj = theme as Record<string, unknown> | null;
    const nested = themeObj?.colors as Record<string, unknown> | undefined;
    const primary = nested?.primary ?? (themeObj as Record<string, unknown> | null)?.primary;
    if (typeof primary === 'string') {return primary;}
  }
  return undefined;
}

export function resolveSpacingValue(value: unknown, theme: unknown): number | undefined {
  if (typeof value === 'number') {return value;}
  const spacing = (theme as Record<string, unknown> | null)?.spacing as ThemeSpacing | undefined;
  if (typeof spacing !== 'object' || spacing === null) {return undefined;}
  if (typeof value !== 'string') {return undefined;}
  const resolved = spacing[value as keyof ThemeSpacing];
  if (typeof resolved === 'number') {return resolved;}
  return undefined;
}

export function getThemeColor(colors: ThemeColors, path: string): string {
  const segments = path.split('.');
  let current: ColorTree = colors as ColorTree;
  for (const segment of segments) {
    const value = current[segment];
    if (typeof value === 'string') {return value;}
    if (typeof value !== 'object' || value === null) {break;}
    current = value as ColorTree;
  }
  const primary = colors.primary;
  if (typeof primary === 'string') {return primary;}
  return '#000000';
}
