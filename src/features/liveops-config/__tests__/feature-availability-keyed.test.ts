import { readFileSync } from 'fs';
import { join } from 'path';

import type { FeatureAccess } from '../feature-access';
import {
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  getFeatureAvailability,
  getFeatureAvailabilityFor,
} from '../feature-availability';

function degradedFeature(): FeatureAccess {
  return {
    isUnlocked: true,
    isVisible: true,
    isDegraded: true,
    lockedDescription: 'Temporarily unavailable',
    recommendedUnlockMoment: 'Later',
    unlockReason: 'Unlocked',
    releaseState: 'final_release_progressive',
  };
}

function readProjectFile(pathFromRoot: string): string {
  return readFileSync(join(process.cwd(), pathFromRoot), 'utf8');
}

describe('keyed FeatureAvailability', () => {
  it('route, premium, prefetch, and notification systems use keyed availability', () => {
    const files = [
      'src/navigation/feature-route-registry.ts',
      'src/navigation/feature-exposure/feature-exposure.ts',
      'src/navigation/premium-route-gating.ts',
      'src/navigation/notification-filters.ts',
      'src/screens/notifications/NotificationScreenConfig.ts',
      'src/hooks/usePrefetchQueries.ts',
      'src/screens/progress/progress-actions.ts',
      'src/features/liveops-config/feature-access-store.ts',
    ];

    for (const file of files) {
      const source = readProjectFile(file);
      expect(source).toContain('getFeatureAvailabilityFor(');
      expect(source).not.toMatch(/getFeatureAvailability\((?!For)/);
    }
  });

  it('premium degraded is disabled only through keyed helper', () => {
    const generic = getFeatureAvailability(degradedFeature());
    const premium = getFeatureAvailabilityFor('premium_paywall', degradedFeature());

    expect(generic.state).toBe('degraded');
    expect(generic.canRenderEntryPoint).toBe(true);
    expect(premium.state).toBe('degraded');
    expect(premium.canRenderEntryPoint).toBe(true);
  });

  it('boss degraded keeps subtle fallback surface but blocks route', () => {
    const boss = getFeatureAvailabilityFor('boss_tab', degradedFeature());

    expect(boss.state).toBe('degraded');
    expect(boss.canRenderEntryPoint).toBe(true);
    expect(boss.canNavigate).toBe(false);
    expect(getDegradedFallbackSurface('boss_tab')).toBe('boss_teaser');
  });

  it('content_study degraded blocks upload and advanced study surfaces', () => {
    const study = getFeatureAvailabilityFor('content_study', degradedFeature());
    const blocked = getDegradedBlockedSurfaces(['content_study']);

    expect(study.canNavigate).toBe(false);
    expect(study.canQuery).toBe(false);
    expect(blocked).toEqual(expect.arrayContaining(['upload_cta', 'content_generation']));
  });

  it('ai_coach_advanced degraded falls back to CoachPresence surface', () => {
    const coach = getFeatureAvailabilityFor('ai_coach_advanced', degradedFeature());

    expect(coach.canNavigate).toBe(false);
    expect(coach.canQuery).toBe(false);
    expect(getDegradedFallbackSurface('ai_coach_advanced')).toBe('coach_presence');
  });
});
