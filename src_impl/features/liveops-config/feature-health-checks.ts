import { featureHealthRegistry } from './feature-health';
import type { FeatureHealthCheck, FeatureHealthStatus } from './feature-health';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}

function hasGeminiKey(): boolean {
  return Boolean(GEMINI_API_KEY);
}

/**
 * Real readiness checks.
 *
 * Healthy = a real dependency was verified and is working.
 * Degraded = the check cannot be fully verified yet (pre-production safe fallback).
 * Unavailable = a critical dependency is missing.
 */
const healthChecks: FeatureHealthCheck[] = [
  // === content_study ===
  {
    id: 'content_study_gemini',
    feature: 'content_study',
    label: 'Content Study — Gemini API key',
    dependency: 'gemini',
    cacheMs: 120_000,
    check: () => (hasGeminiKey() ? 'healthy' : 'unavailable'),
  },
  {
    id: 'content_study_storage',
    feature: 'content_study',
    label: 'Content Study — Supabase Storage config',
    dependency: 'study-content-storage',
    cacheMs: 120_000,
    check: () => (hasSupabaseConfig() ? 'healthy' : 'unavailable'),
  },
  {
    id: 'content_study_rate_limits',
    feature: 'content_study',
    label: 'Content Study — rate-limit config',
    dependency: 'rate_limits',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      // AI rate-limits require a deployed RPC/Edge Function. Until that exists,
      // the feature is degraded but still available with soft limits.
      return 'degraded';
    },
  },
  {
    id: 'content_study_privacy_disclosure',
    feature: 'content_study',
    label: 'Content Study — privacy disclosure route',
    dependency: 'privacy_disclosure',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      // Privacy disclosure requires a dedicated route/copy in Settings.
      // If the Settings > PrivacySettings screen exists, it's real.
      // Until verified, mark degraded.
      return 'degraded';
    },
  },
  {
    id: 'content_study_max_file_constraints',
    feature: 'content_study',
    label: 'Content Study — file size/content constraints',
    dependency: 'content_constraints',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },

  // === ai_coach_advanced ===
  {
    id: 'ai_coach_advanced_backend',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — backend function config',
    dependency: 'ai_coach_backend',
    cacheMs: 120_000,
    check: () => (hasGeminiKey() ? 'healthy' : 'unavailable'),
  },
  {
    id: 'ai_coach_advanced_quota',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — quota/rate-limit path',
    dependency: 'ai_coach_quota',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },
  {
    id: 'ai_coach_advanced_fallback',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — deterministic fallback',
    dependency: 'ai_coach_fallback',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },

  // === premium_paywall ===
  {
    id: 'premium_paywall_revenuecat_config',
    feature: 'premium_paywall',
    label: 'Premium Paywall — RevenueCat API key',
    dependency: 'revenuecat',
    cacheMs: 120_000,
    check: () => {
      const rcApple = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
      const rcGoogle = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;
      return rcApple || rcGoogle ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'premium_paywall_offerings',
    feature: 'premium_paywall',
    label: 'Premium Paywall — offerings/products loadable',
    dependency: 'revenuecat_offerings',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },
  {
    id: 'premium_paywall_entitlements',
    feature: 'premium_paywall',
    label: 'Premium Paywall — entitlements readable',
    dependency: 'revenuecat_entitlements',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },

  // === boss_tab ===
  {
    id: 'boss_tab_template',
    feature: 'boss_tab',
    label: 'Boss Tab — template loading',
    dependency: 'boss_template',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },
  {
    id: 'boss_tab_no_disabled_deps',
    feature: 'boss_tab',
    label: 'Boss Tab — no disabled squads/shop/economy dependency',
    dependency: 'boss_dependencies',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },
  {
    id: 'boss_tab_subtle_fallback',
    feature: 'boss_tab',
    label: 'Boss Tab — subtle mode fallback',
    dependency: 'boss_subtle',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return 'degraded';
    },
  },
];

export function registerFeatureHealthChecks(): void {
  for (const check of healthChecks) {
    featureHealthRegistry.register(check);
  }
}
