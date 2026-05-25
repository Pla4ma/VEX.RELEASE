export type DegradedFeatureKey =
  | 'content_study'
  | 'ai_coach_advanced'
  | 'premium_paywall'
  | 'boss_tab';

export const DEGRADED_SURFACE_BLOCKS: Record<
  DegradedFeatureKey,
  { blockedSurfaces: string[]; fallbackSurface: string }
> = {
  content_study: {
    blockedSurfaces: ['study_layer', 'upload_cta', 'content_generation'],
    fallbackSurface: 'start_session',
  },
  ai_coach_advanced: {
    blockedSurfaces: ['advanced_coach_cta', 'deep_intervention'],
    fallbackSurface: 'coach_presence',
  },
  premium_paywall: {
    blockedSurfaces: ['premium_tease', 'purchasable_plan', 'paywall'],
    fallbackSurface: 'start_session',
  },
  boss_tab: {
    blockedSurfaces: ['boss_full_cta', 'boss_combat', 'boss_route'],
    fallbackSurface: 'boss_teaser',
  },
};

export function getDegradedBlockedSurfaces(
  degradedFeatures: DegradedFeatureKey[],
): string[] {
  return degradedFeatures.flatMap(
    (key) => DEGRADED_SURFACE_BLOCKS[key]?.blockedSurfaces ?? [],
  );
}

export function shouldBlockFullSurface(
  feature: DegradedFeatureKey,
  isDegraded: boolean,
): boolean {
  return isDegraded && DEGRADED_SURFACE_BLOCKS[feature] !== undefined;
}

export function getDegradedFallbackSurface(
  feature: DegradedFeatureKey,
): string {
  return DEGRADED_SURFACE_BLOCKS[feature]?.fallbackSurface ?? 'start_session';
}
