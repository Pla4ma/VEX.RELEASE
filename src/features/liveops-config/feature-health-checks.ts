import { featureHealthRegistry } from './feature-health';
import type { FeatureHealthCheck, FeatureHealthStatus } from './feature-health';
import { CONTENT_STUDY_CONSTANTS } from '../content-study/types';
import { premiumRevenueCatHealthChecks } from './premium-revenuecat-health-checks';
import { bossHealthChecks } from './boss-health-checks';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const CONTENT_STUDY_FUNCTION =
  process.env.EXPO_PUBLIC_CONTENT_STUDY_FUNCTION ?? 'generate-study-plan';
const AI_COACH_FUNCTION =
  process.env.EXPO_PUBLIC_AI_COACH_FUNCTION === 'ai-router'
    ? 'ai-coach'
    : process.env.EXPO_PUBLIC_AI_COACH_FUNCTION ?? 'ai-coach';

function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}

function hasGeminiKey(): boolean {
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return typeof geminiKey === 'string' && geminiKey.trim().length > 0;
}

function hasFunctionName(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasContentStudyConstraints(): boolean {
  return (
    CONTENT_STUDY_CONSTANTS.MAX_PDF_SIZE > 0 &&
    CONTENT_STUDY_CONSTANTS.SUPPORTED_PDF_TYPES.includes('application/pdf') &&
    CONTENT_STUDY_CONSTANTS.SUPPORTED_TEXT_TYPES.length > 0 &&
    CONTENT_STUDY_CONSTANTS.MAX_YOUTUBE_URL_LENGTH > 0
  );
}

export const healthChecks: FeatureHealthCheck[] = [
  {
    id: 'content_study_gemini',
    feature: 'content_study',
    label: 'Content Study — Gemini/API function config',
    dependency: 'gemini',
    cacheMs: 120_000,
    check: () =>
      hasGeminiKey() && hasFunctionName(CONTENT_STUDY_FUNCTION)
        ? 'healthy'
        : 'unavailable',
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
      const limit = CONTENT_STUDY_CONSTANTS.DAILY_GENERATION_LIMIT;
      if (limit <= 0) {return 'unavailable';}
      if (!hasSupabaseConfig()) {return 'degraded';}
      return hasGeminiKey() ? 'healthy' : 'degraded';
    },
  },
  {
    id: 'content_study_privacy_disclosure',
    feature: 'content_study',
    label:
      'Content Study — privacy disclosure route (passive until route verification exists)',
    dependency: 'privacy_disclosure',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return hasGeminiKey() && hasSupabaseConfig() ? 'healthy' : 'unavailable';
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
    check: () =>
      hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION)
        ? 'healthy'
        : 'unavailable',
  },
  {
    id: 'ai_coach_advanced_quota',
    feature: 'ai_coach_advanced',
    label:
      'AI Coach Advanced — quota/rate-limit path (infrastructure verified, runtime quota tracking pending)',
    dependency: 'ai_coach_quota',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION)
        ? 'healthy'
        : 'unavailable';
    },
  },
  {
    id: 'ai_coach_advanced_fallback',
    feature: 'ai_coach_advanced',
    label:
      'AI Coach Advanced — deterministic fallback (infrastructure verified, runtime integration pending)',
    dependency: 'ai_coach_fallback',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION)
        ? 'healthy'
        : 'unavailable';
    },
  },
  {
    id: 'ai_coach_advanced_safe_intent',
    feature: 'ai_coach_advanced',
    label:
      'AI Coach Advanced — safe action-intent routing (infrastructure verified, runtime routing pending)',
    dependency: 'ai_intent_routing',
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return hasGeminiKey() && hasFunctionName(AI_COACH_FUNCTION)
        ? 'healthy'
        : 'unavailable';
    },
  },
  ...premiumRevenueCatHealthChecks,
  ...bossHealthChecks,
];

export function registerFeatureHealthChecks(): void {
  for (const check of healthChecks) {featureHealthRegistry.register(check);}
}
