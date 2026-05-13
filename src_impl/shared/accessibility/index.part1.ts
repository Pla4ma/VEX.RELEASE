import { I18nManager, AccessibilityInfo, Platform } from "react-native";


export function setLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang;

  // Enable RTL for specific languages
  const isRTLLanguage = lang === 'ar' || lang === 'he';
  I18nManager.allowRTL(isRTLLanguage);
  I18nManager.forceRTL(isRTLLanguage);
}

export function getLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function t(key: keyof TranslationKeys): string {
  const translation = TRANSLATIONS[currentLanguage];
  return translation[key] || TRANSLATIONS.en[key] || key;
}

export function tInterpolated(
  key: keyof TranslationKeys,
  values: Record<string, string | number>
): string {
  let text = t(key);
  for (const [k, v] of Object.entries(values)) {
    text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
  }
  return text;
}

export function announce(message: string): void {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

export async function isScreenReaderEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isScreenReaderEnabled();
}

export function getButtonA11yProps(
  label: string,
  hint?: string
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
  label: string
): {
  accessible: true;
  accessibilityRole: 'progressbar';
  accessibilityLabel: string;
  accessibilityValue: {
    min: number;
    max: number;
    now: number;
    text: string;
  };
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

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

export function getDirectionalStyles<T extends Record<string, unknown>>(
  styles: T
): T {
  if (!isRTL()) {return styles;}

  // Mirror relevant styles for RTL
  const rtlStyles = { ...styles };

  // Swap left/right margins, paddings, etc.
  const swapKeys = [
    ['marginLeft', 'marginRight'],
    ['paddingLeft', 'paddingRight'],
    ['borderLeftWidth', 'borderRightWidth'],
    ['borderLeftColor', 'borderRightColor'],
    ['left', 'right'],
  ];

  for (const [left, right] of swapKeys) {
    if (left in rtlStyles && right in rtlStyles) {
      const temp = (rtlStyles as Record<string, unknown>)[left];
      (rtlStyles as Record<string, unknown>)[left] = (rtlStyles as Record<string, unknown>)[right];
      (rtlStyles as Record<string, unknown>)[right] = temp;
    }
  }

  return rtlStyles;
}

export function getScaledFontSize(baseSize: number): number {
  // React Native automatically scales fonts based on system settings
  // This is a placeholder for custom scaling logic if needed
  return baseSize;
}

export async function isBoldTextEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isBoldTextEnabled();
}

export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, use a proper color library
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(textColor: string, bgColor: string): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  return ratio >= 4.5; // WCAG AA standard for normal text
}

export function meetsWCAGAAA(textColor: string, bgColor: string): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  return ratio >= 7; // WCAG AAA standard
}