import { AccessibilityInfo, Platform } from 'react-native';

export function announce(message: string): void {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

export async function isScreenReaderEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isScreenReaderEnabled();
}

export async function isBoldTextEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isBoldTextEnabled();
}

export function getScaledFontSize(baseSize: number): number {
  return baseSize;
}

export function getButtonA11yProps(
  label: string,
  hint?: string,
): {
  accessible: true;
  accessibilityRole: 'button';
  accessibilityLabel: string;
  accessibilityHint?: string;
} {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}

export function getProgressA11yProps(
  value: number,
  maximum: number,
  label: string,
): {
  accessible: true;
  accessibilityRole: 'progressbar';
  accessibilityLabel: string;
  accessibilityValue: { min: number; max: number; now: number; text: string };
} {
  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: label,
    accessibilityValue: {
      min: 0,
      max: maximum,
      now: value,
      text: `${Math.round((value / maximum) * 100)}%`,
    },
  };
}
