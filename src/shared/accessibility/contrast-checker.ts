import type { ColorPalette } from "../../theme/types";
import { darkColors, lightColors } from "../../theme/tokens/colors";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("accessibility:contrast");
const WCAG_AA_NORMAL_TEXT = 4.5;

type ContrastPair = {
  background: string;
  foreground: string;
  label: string;
};

function channelToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function parseHex(color: string): [number, number, number] | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return null;
  }
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
}

function luminance(color: string): number | null {
  const rgb = parseHex(color);
  if (!rgb) {
    return null;
  }
  const [r, g, b] = rgb.map(channelToLinear);
  if (r === undefined || g === undefined || b === undefined) {
    return null;
  }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(
  foreground: string,
  background: string,
): number | null {
  const foregroundLum = luminance(foreground);
  const backgroundLum = luminance(background);
  if (foregroundLum === null || backgroundLum === null) {
    return null;
  }
  const lighter = Math.max(foregroundLum, backgroundLum);
  const darker = Math.min(foregroundLum, backgroundLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function buildPairs(name: string, colors: ColorPalette): ContrastPair[] {
  const backgrounds = [
    ["primary background", colors.background.primary],
    ["secondary background", colors.background.secondary],
    ["card surface", colors.surface.card],
    ["button surface", colors.surface.button],
  ] as const;
  const foregrounds = [
    ["primary text", colors.text.primary],
    ["secondary text", colors.text.secondary],
    ["muted text", colors.text.muted],
    ["link text", colors.text.link],
    ["success text", colors.success.DEFAULT],
    ["warning text", colors.warning.DEFAULT],
    ["error text", colors.error.DEFAULT],
    ["info text", colors.info.DEFAULT],
  ] as const;

  return backgrounds.flatMap(([backgroundLabel, background]) =>
    foregrounds.map(([foregroundLabel, foreground]) => ({
      background,
      foreground,
      label: `${name}: ${foregroundLabel} on ${backgroundLabel}`,
    })),
  );
}

export function auditColorContrast(pairs: ContrastPair[]): string[] {
  return pairs.flatMap((pair) => {
    const ratio = getContrastRatio(pair.foreground, pair.background);
    if (ratio === null || ratio >= WCAG_AA_NORMAL_TEXT) {
      return [];
    }
    return [`${pair.label} has ${ratio.toFixed(2)}:1 contrast`];
  });
}

export function initializeDevContrastChecker(): void {
  if (!__DEV__) {
    return;
  }

  const failures = auditColorContrast([
    ...buildPairs("light", lightColors),
    ...buildPairs("dark", darkColors),
  ]);

  if (failures.length === 0) {
    return;
  }
  debug.warn("WCAG AA contrast failures detected", { failures });
}
