import type { SupportedLanguage, TranslationKeys } from '../types';
import { en } from './en';
import { es } from './es';
import { de } from './de';
import { fr } from './fr';
import { ja } from './ja';
import { ar } from './ar';
import { he } from './he';

export const TRANSLATIONS: Record<SupportedLanguage, TranslationKeys> = {
  en,
  es,
  de,
  fr,
  ja,
  ar,
  he,
};
