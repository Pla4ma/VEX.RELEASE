import { buildFeatureAccess, getFeatureAvailability } from '../feature-access';
import { buildRootExposureFlags } from '../../../navigation/feature-exposure';

const allFlagsOn = (): boolean => true;

describe('progressive unlock contract', () => {
  it('keeps disabled beta systems non-renderable, non-navigable, and non-queryable', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 99 });

    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.battle_pass.isVisible).toBe(false);
    expect(getFeatureAvailability(features.battle_pass)).toMatchObject({
      state: 'disabled',
      canNavigate: false,
      canQuery: false,
      canRenderEntryPoint: false,
      canUseBackend: false,
    });
  });

  it('does not expose secondary systems to a brand-new user', () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(stage).toBe('NEW_USER');
    expect(productTier).toBe('CORE');
    expect(show.challenges).toBe(false);
    expect(show.boss).toBe(false);
    expect(show.study).toBe(false);
    expect(show.battlePass).toBe(false);
    expect(features.challenges.isTeased).toBe(false);
  });

  it('teases only the next useful layer during activation', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 2 });

    expect(features.companion_detail.isUnlocked).toBe(false);
    expect(features.companion_detail.isTeased).toBe(true);
    expect(features.companion_detail.priority).toBeGreaterThan(0);
    expect(features.boss_tab.isTeased).toBe(false);
  });

  it('unlocks heavy features only when visible, healthy, and ready for backend use', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 12 });

    expect(getFeatureAvailability(features.content_study)).toMatchObject({
      state: 'unlocked',
      canNavigate: true,
      canQuery: true,
      canRenderEntryPoint: true,
      canUseBackend: true,
    });
  });
});
