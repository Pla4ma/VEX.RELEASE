import { useMemo } from 'react';
import { useOnboardingStore } from '../store';
import {
  getLanguageTier,
  getActiveLanguage,
  type LanguageTier,
  type LanguageSet,
} from '../language-tier';

export function useLanguageTier(): {
  tier: LanguageTier;
  language: LanguageSet;
} {
  const motivationProfile = useOnboardingStore((s) => s.motivationProfile);

  return useMemo(() => {
    const tier = getLanguageTier(motivationProfile?.primary);
    return { tier, language: getActiveLanguage(tier) };
  }, [motivationProfile?.primary]);
}
