import { featureHealthRegistry } from './feature-health';
import type { FeatureHealthCheck } from './feature-health';

const healthChecks: FeatureHealthCheck[] = [
  {
    id: 'content_study_gemini',
    feature: 'content_study',
    label: 'Content Study — Gemini API',
    dependency: 'gemini',
    cacheMs: 120_000,
    check: async () => {
      const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
      return key ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'content_study_storage',
    feature: 'content_study',
    label: 'Content Study - Supabase Storage',
    dependency: 'study-content-storage',
    cacheMs: 120_000,
    check: () => {
      const hasSupabase =
        Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
      return hasSupabase ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'content_study_rate_limits',
    feature: 'content_study',
    label: 'Content Study - rate limits',
    dependency: 'rate_limits',
    cacheMs: 300_000,
    check: () => 'healthy',
  },
  {
    id: 'content_study_privacy_disclosure',
    feature: 'content_study',
    label: 'Content Study - privacy disclosure',
    dependency: 'privacy_disclosure',
    cacheMs: 300_000,
    check: () => 'healthy',
  },
  {
    id: 'ai_coach_advanced_quota',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — quota check',
    dependency: 'ai_coach',
    cacheMs: 300_000,
    check: () => 'healthy',
  },
  {
    id: 'premium_paywall_revenuecat',
    feature: 'premium_paywall',
    label: 'Premium Paywall — RevenueCat',
    dependency: 'revenuecat',
    cacheMs: 120_000,
    check: () => 'healthy',
  },
  {
    id: 'boss_tab_template',
    feature: 'boss_tab',
    label: 'Boss Tab — template availability',
    dependency: 'boss_template',
    cacheMs: 300_000,
    check: () => 'healthy',
  },
];

export function registerFeatureHealthChecks(): void {
  for (const check of healthChecks) {
    featureHealthRegistry.register(check);
  }
}
