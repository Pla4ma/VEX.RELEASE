import { applyCompletionSubsystems } from '../completion-subsystems';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';
import {
  mockOrder, mockCompleteSession, baseLedger, baseSummary, defaultFeatureAccess,
} from './completion-subsystems.helpers';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    mockOrder.length = 0;
    jest.clearAllMocks();
    setFeatureAccessMap(defaultFeatureAccess);
  });

  it('skips feature-dependent subsystems when feature is locked', async () => {
    setFeatureAccessMap({
      companion_detail: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'final_release_progressive',
      },
      challenges: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'final_release_progressive',
      },
    } as FeatureAccessMap);

    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result.degradedSystems).toEqual([]);
    expect(mockOrder).toEqual(['focus-identity', 'streak', 'progression', 'rewards']);
    expect(result.ledger.companionReactionId).toBeNull();
    expect(result.ledger.dailyMissionResult.status).toBe('unchanged');
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });
});
