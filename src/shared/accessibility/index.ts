export type { SupportedLanguage, TranslationKeys } from './types';
export { TRANSLATIONS } from './i18n';
export { setLanguage, getLanguage, t, tInterpolated } from './i18n';
export { announce, isScreenReaderEnabled, isBoldTextEnabled } from './a11y';
export { getScaledFontSize, getButtonA11yProps, getProgressA11yProps } from './a11y';
export { isRTL, getDirectionalStyles } from './rtl';
export { getContrastRatio, meetsWCAGAA, meetsWCAGAAA } from './contrast';
