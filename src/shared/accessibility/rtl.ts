import { I18nManager } from 'react-native';

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

export function getDirectionalStyles<T extends Record<string, unknown>>(
  styles: T,
): T {
  if (!isRTL()) {
    return styles;
  }
  const rtlStyles: Record<string, unknown> = { ...styles };
  const swapKeys: [string, string][] = [
    ['marginLeft', 'marginRight'],
    ['paddingLeft', 'paddingRight'],
    ['borderLeftWidth', 'borderRightWidth'],
    ['borderLeftColor', 'borderRightColor'],
    ['left', 'right'],
  ];
  for (const [left, right] of swapKeys) {
    if (left in rtlStyles && right in rtlStyles) {
      const temp = rtlStyles[left];
      rtlStyles[left] = rtlStyles[right];
      rtlStyles[right] = temp;
    }
  }
  // Safe narrowing: we started from T and only swapped values between existing keys
  return rtlStyles as T;
}
