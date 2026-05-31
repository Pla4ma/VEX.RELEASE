/**
 * Contrast calculation and accessible color utility functions.
 */

import type { ContrastCheck } from './types';

export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateLuminance(color1);
  const luminance2 = calculateLuminance(color2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

function calculateLuminance(color: string): number {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminances = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  const lr = luminances[0]!;
  const lg = luminances[1]!;
  const lb = luminances[2]!;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function checkContrast(
  foreground: string,
  background: string,
): ContrastCheck {
  const ratio = calculateContrastRatio(foreground, background);
  return {
    foreground,
    background,
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

export function getAccessibleAlternatives(
  targetColor: string,
  backgroundColor: string,
  minContrast: number = 4.5,
): string[] {
  const alternatives: string[] = [];
  for (let i = 0; i <= 100; i += 10) {
    const lighter = adjustBrightness(targetColor, i);
    const darker = adjustBrightness(targetColor, -i);
    if (calculateContrastRatio(lighter, backgroundColor) >= minContrast) {
      alternatives.push(lighter);
    }
    if (calculateContrastRatio(darker, backgroundColor) >= minContrast) {
      alternatives.push(darker);
    }
  }
  return alternatives.slice(0, 3);
}

function adjustBrightness(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const adjust = (c: number) => {
    const adjusted = c + (255 * percent) / 100;
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };
  const nr = adjust(r);
  const ng = adjust(g);
  const nb = adjust(b);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}
