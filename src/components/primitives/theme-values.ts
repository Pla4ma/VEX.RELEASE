export type ThemeColors = { [key: string]: unknown };
export type ThemeSpacing = Record<string, number>;

export type ColorTree = { colors?: ThemeColors } & ThemeColors;

export function resolveColorValue(value: unknown, theme: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  // Literal CSS color values (hex, rgb, rgba, hsl, etc.)
  const isLiteralColor = /^#|^rgba?\(|^hsla?\(|^hsva?\(|^transparent$/i.test(value);
  if (isLiteralColor) return value;

  const themeObj = theme as Record<string, unknown> | null;
  const colors = themeObj?.colors as Record<string, unknown> | undefined;
  if (!colors) return value;

  // Theme path resolution (e.g. "text.primary", "semantic.vexCyan")
  if (value.includes('.')) {
    return getThemeColor(colors, value);
  }

  // Shorthand semantic resolution: try common nested groups
  const groups = ['semantic', 'text', 'border', 'surface', 'background', 'accent'];
  for (const group of groups) {
    const groupObj = colors[group] as Record<string, unknown> | undefined;
    if (groupObj && typeof groupObj[value] === 'string') {
      return groupObj[value] as string;
    }
  }

  // Top-level direct string lookup
  if (typeof colors[value] === 'string') {
    return colors[value] as string;
  }

  // Return as literal CSS color name (e.g. "white", "red", "cyan")
  return value;
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
