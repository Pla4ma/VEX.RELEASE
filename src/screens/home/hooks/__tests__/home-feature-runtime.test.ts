import { buildFeatureAccess } from '../../../../features/liveops-config/feature-access';
import { buildHomeFeatureRuntime } from '../home-feature-runtime';

describe('buildHomeFeatureRuntime', () => {
  it('does not query locked or teased systems on day zero', () => {
    const access = buildFeatureAccess({ totalCompletedSessions: 0 });
    const runtime = buildHomeFeatureRuntime({
      features: access.features,
      productTier: access.productTier,
      totalSessions: 0,
    });

    expect(runtime.canQueryBoss).toBe(false);
    expect(runtime.canQueryChallenges).toBe(false);
    expect(runtime.canQueryStudy).toBe(false);
    expect(runtime.canQuerySquads).toBe(false);
  });
});
