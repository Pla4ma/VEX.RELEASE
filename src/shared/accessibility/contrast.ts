export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function meetsWCAGAA(textColor: string, bgColor: string): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  return ratio >= 4.5;
}

export function meetsWCAGAAA(textColor: string, bgColor: string): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  return ratio >= 7;
}
