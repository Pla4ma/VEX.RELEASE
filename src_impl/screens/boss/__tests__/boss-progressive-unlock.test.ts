import { describe, expect, it } from '@jest/globals';

import { buildFeatureAccess } from '../../../features/liveops-config/feature-access';
import type { FeatureKey } from '../../../features/liveops-config/feature-access';
import { getFeatureAvailability } from '../../../features/liveops-config/feature-availability';
import { getBossScreenCopy } from '../BossScreenSections';

function resolveBossIntensity(style: string | null): string {
  switch (style) {
    case 'game_like':
    case 'competitive':
      return 'game-like';
    case 'intense':
      return 'intense';
    default:
      return 'subtle';
  }
}

describe('BossScreen progressive unlock', () => {
  it('locked boss cannot query or navigate', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 0 });
    const availability = getFeatureAvailability(features.features.boss_tab);

    expect(availability.canQuery).toBe(false);
    expect(availability.canUseBackend).toBe(false);
    expect(availability.canNavigate).toBe(false);
  });

  it('degraded boss reports degraded availability', () => {
    const features = buildFeatureAccess({
      degradedFeatures: new Set<FeatureKey>(['boss_tab']),
      totalCompletedSessions: 20,
    });

    expect(getFeatureAvailability(features.features.boss_tab).state).toBe('degraded');
  });

  it('maps motivation styles to public v1 boss intensity', () => {
    expect(resolveBossIntensity('calm')).toBe('subtle');
    expect(resolveBossIntensity('friendly')).toBe('subtle');
    expect(resolveBossIntensity('study_focused')).toBe('subtle');
    expect(resolveBossIntensity('game_like')).toBe('game-like');
    expect(resolveBossIntensity('intense')).toBe('intense');
  });

  it('does not expose squads when squad feature is disabled', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 10 });
    const availability = getFeatureAvailability(features.features.squads);

    expect(availability.canQuery).toBe(false);
    expect(availability.canRenderEntryPoint).toBe(false);
  });

  it('uses subtle momentum copy for calm users', () => {
    const subtleCopy = getBossScreenCopy('subtle');

    expect(subtleCopy.title).toContain('Focus');
    expect(subtleCopy.title).not.toContain('Battle');
    expect(subtleCopy.intro).not.toMatch(/damage|attack|combat/i);
  });

  it('uses boss health copy only for game-like or intense users', () => {
    expect(getBossScreenCopy('game-like').title).toContain('Boss');
    expect(getBossScreenCopy('intense').intro).toContain('work stays the center');
  });
});
