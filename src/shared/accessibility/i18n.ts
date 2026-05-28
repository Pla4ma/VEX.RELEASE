import { I18nManager } from "react-native";
import type { SupportedLanguage, TranslationKeys } from "./types";
import { TRANSLATIONS } from "./translations";

let currentLanguage: SupportedLanguage = "en";

export function setLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang;
  const isRTLLanguage = lang === "ar" || lang === "he";
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
  values: Record<string, string | number>,
): string {
  let text = t(key);
  for (const [k, v] of Object.entries(values)) {
    text = text.replace(new RegExp(`{{${k}}}`, "g"), String(v));
  }
  return text;
}

export { TRANSLATIONS };
