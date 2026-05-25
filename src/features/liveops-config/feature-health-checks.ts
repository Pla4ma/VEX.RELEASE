import { featureHealthRegistry } from './feature-health';
import type { FeatureHealthCheck, FeatureHealthStatus } from './feature-health';
import { CONTENT_STUDY_CONSTANTS } from '../content-study/types';
import { DISABLED_FEATURES } from './feature-access-config';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const CONTENT_STUDY_FUNCTION = process.env.EXPO_PUBLIC_CONTENT_STUDY_FUNCTION ?? 'generate-study-plan';
const AI_COACH_FUNCTION = process.env.EXPO_PUBLIC_AI_COACH_FUNCTION ?? 'ai-router';
function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}
function hasGeminiKey(): boolean {
  return hasFunctionName(CONTENT_STUDY_FUNCTION) || hasFunctionName(AI_COACH_FUNCTION);
}
function hasFunctionName(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
function hasContentStudyConstraints(): boolean {
  return CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE > 0 &&
    CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES.includes('application/pdf') &&
    CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES.length > 0 &&
    CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH > 0;
}
function bossFinalReleaseForbiddenDepsAreDisabled(): boolean {
  const disabled = new Set(DISABLED_FEATURES);
  return disabled.has('squads') && disabled.has('shop') && disabled.has('economy_advanced');
}
export const healthChecks: FeatureHealthCheck[] = [
  {
    id: 'content_study_gemini',
    feature: 'content_study',
    label: 'Content Study — Gemini/API function config',
    dependency: 'gemini',
    cacheMs: 120_000,
    check: () => (hasGeminiKey() && hasFunctionName(CONTENT_STUDY_FUNCTION) ? 'healthy' : 'unavailable'),
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
      return CONTENT_STUDY_CONSTANTS.DAILY_GENERATION_LIMIT > 0 ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'content_study_privacy_disclosure',
    feature: 'content_study',
    label: 'Content Study — privacy disclosure route (verify route registered)',
    dependency: 'privacy_disclosure',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasRoute = hasGeminiKey() && hasSupabaseConfig();
      return hasRoute ? 'degraded' : 'unavailable';
    },
  },
  {
    id: 'content_study_max_file_constraints',
    feature: 'content_study',
    label: 'Content Study — file size/content constraints',
    dependency: 'content_constraints',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return hasContentStudyConstraints() ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'ai_coach_advanced_backend',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — backend function config',
    dependency: 'ai_coach_backend',
    cacheMs: 120_000,
    check: () => (hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION) ? 'healthy' : 'unavailable'),
  },
  {
    id: 'ai_coach_advanced_quota',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — quota/rate-limit path (needs backend quota tracking)',
    dependency: 'ai_coach_quota',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasBackend = hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION);
      return hasBackend ? 'degraded' : 'unavailable';
    },
  },
  {
    id: 'ai_coach_advanced_fallback',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — deterministic fallback (needs fallback integration tests)',
    dependency: 'ai_coach_fallback',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasBackend = hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION);
      return hasBackend ? 'degraded' : 'unavailable';
    },
  },
  {
    id: 'ai_coach_advanced_safe_intent',
    feature: 'ai_coach_advanced',
    label: 'AI Coach Advanced — safe action-intent routing (needs intent routing verification)',
    dependency: 'ai_intent_routing',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasBackend = hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION);
      return hasBackend ? 'degraded' : 'unavailable';
    },
  },
  {
    id: 'premium_paywall_revenuecat_config',
    feature: 'premium_paywall',
    label: 'Premium Paywall — RevenueCat API key',
    dependency: 'revenuecat',
    cacheMs: 120_000,
    check: () => {
      const ios = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
      const android = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
      return ios || android ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'premium_paywall_offerings',
    feature: 'premium_paywall',
    label: 'Premium Paywall — RevenueCat API keys configured (offerings loadable at runtime)',
    dependency: 'revenuecat_offerings',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasRcKey = Boolean(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY);
      return hasRcKey ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'premium_paywall_entitlements',
    feature: 'premium_paywall',
    label: 'Premium Paywall — RevenueCat API keys configured (entitlements readable at runtime)',
    dependency: 'revenuecat_entitlements',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasRcKey = Boolean(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY);
      return hasRcKey ? 'healthy' : 'unavailable';
    },
  },
  {
    id: 'boss_tab_template',
    feature: 'boss_tab',
    label: 'Boss Tab — template loading (needs template asset verification)',
    dependency: 'boss_template',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasDeps = bossFinalReleaseForbiddenDepsAreDisabled();
      return hasDeps ? 'degraded' : 'unavailable';
    },
  },
  {
    id: 'boss_tab_no_disabled_deps',
    feature: 'boss_tab',
    label: 'Boss Tab — final-release forbidden deps (squads/shop/economy) are disabled',
    dependency: 'boss_dependencies',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return bossFinalReleaseForbiddenDepsAreDisabled() ? 'healthy' : 'degraded';
    },
  },
  {
    id: 'boss_tab_subtle_fallback',
    feature: 'boss_tab',
    label: 'Boss Tab — subtle mode fallback (needs subtle mode integration tests)',
    dependency: 'boss_subtle',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasDeps = bossFinalReleaseForbiddenDepsAreDisabled();
      return hasDeps ? 'degraded' : 'unavailable';
    },
  },
  {
    id: 'boss_tab_route_gating',
    feature: 'boss_tab',
    label: 'Boss Tab — route/query/event subscription gating (needs route integration tests)',
    dependency: 'boss_route_gating',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      const hasDeps = bossFinalReleaseForbiddenDepsAreDisabled();
      return hasDeps ? 'degraded' : 'unavailable';
    },
  },
];
export function registerFeatureHealthChecks(): void {
  for (const check of healthChecks) featureHealthRegistry.register(check);
}
