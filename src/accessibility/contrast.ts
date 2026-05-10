/**
 * Accessibility Contrast Utilities
 *
 * WCAG 2.1 AA compliance support for color contrast
 */

import { ContrastCheck } from './types';

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateLuminance(color1);
  const luminance2 = calculateLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

function calculateLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate luminance
  const [lr, lg, lb] = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Check if colors meet WCAG standards
 */
export function checkContrast(foreground: string, background: string): ContrastCheck {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    foreground,
    background,
    ratio,
    passesAA: ratio >= 4.5, // WCAG AA standard for normal text
    passesAAA: ratio >= 7, // WCAG AAA standard
  };
}

/**
 * Get accessible color alternatives
 */
export function getAccessibleAlternatives(targetColor: string, backgroundColor: string, minContrast: number = 4.5): string[] {
  const alternatives: string[] = [];

  // Try lightening/darkening
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

  return alternatives.slice(0, 3); // Return top 3
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
