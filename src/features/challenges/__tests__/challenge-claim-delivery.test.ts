import { claimChallengeReward } from '../challenge-claim';
import * as repository from '../repository';
import { getProgressionService } from '../../../progression/ProgressionService';
import { getRewardService } from '../../../rewards/RewardService';
import { ChallengeDetailSchema } from '../schemas';
import { grantCurrencyRpc } from '../../economy/repository';

const mockAddXp = jest.fn();
const mockReceipt = jest.fn();
const mockAvailability = jest.fn();
jest.mock('../repository');
jest.mock('../../../progression/ProgressionService', () => ({ getProgressionService: jest.fn(() => ({ addXP: mockAddXp })) }));
jest.mock('../../../rewards/RewardService', () => ({ getRewardService: jest.fn(() => ({ grantReward: mockReceipt })) }));
jest.mock('../../liveops-config/feature-access-store', () => ({ getAvailabilityFor: () => mockAvailability() }));
jest.mock('../../economy/repository', () => ({ grantCurrencyRpc: jest.fn() }));
jest.mock('../../../events/EventBus', () => ({ eventBus: { publish: jest.fn() } }));

const detail = ChallengeDetailSchema.parse({
  challenge: { id: 'c-1', seasonId: 'season-1', type: 'DAILY', category: 'SESSIONS',
    title: 'Focus', description: 'Finish a block', targetValue: 1, targetType: 'SESSIONS', rewardType: 'XP', rewardAmount: 100 },
  userChallenge: { id: 'uc-1', userId: 'user-1', challengeId: 'c-1', currentValue: 1,
    status: 'COMPLETED', assignedAt: 1 },
  xpReward: 100, coinReward: 50, requiredCount: 1,
});

describe('Challenge reward delivery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddXp.mockResolvedValue(undefined);
    mockReceipt.mockResolvedValue(undefined);
    mockAvailability.mockReturnValue({ canUseBackend: false });
    jest.mocked(repository.fetchCompletedChallengeDetails).mockResolvedValue([detail]);
  });

  it('credits XP once through progression and exposes no archived coin delivery', async () => {
    const result = await claimChallengeReward({ userId: 'user-1', challengeId: 'c-1' });
    expect(result.success).toBe(true);
    expect(result.rewards.map((reward) => reward.type)).toEqual(['XP']);
    expect(getProgressionService).toHaveBeenCalledWith('user-1');
    expect(mockAddXp).toHaveBeenCalledWith(100, 'CHALLENGE_BONUS',
      { idempotencyKey: 'challenge:user-1:c-1:xp', metadata: { challengeId: 'c-1' } });
    expect(getRewardService).toHaveBeenCalledWith('user-1');
    expect(grantCurrencyRpc).not.toHaveBeenCalled();
    expect(repository.updateUserChallenge).toHaveBeenCalledWith('user-1', 'c-1', expect.objectContaining({ status: 'CLAIMED' }));
  });

  it('keeps a failed XP credit claimable rather than marking delivery', async () => {
    mockAddXp.mockRejectedValue(new Error('Credit unavailable'));
    const result = await claimChallengeReward({ userId: 'user-1', challengeId: 'c-1' });
    expect(result).toMatchObject({ success: false, error: 'Credit unavailable' });
    expect(mockReceipt).not.toHaveBeenCalled();
    expect(repository.updateUserChallenge).not.toHaveBeenCalled();
  });

  it('does not claim delivery after a rejected currency grant', async () => {
    mockAvailability.mockReturnValue({ canUseBackend: true });
    jest.mocked(grantCurrencyRpc).mockResolvedValue({ success: false, new_balance: 0, error: 'Grant rejected' });
    const result = await claimChallengeReward({ userId: 'user-1', challengeId: 'c-1' });
    expect(result.success).toBe(false);
    expect(repository.updateUserChallenge).not.toHaveBeenCalled();
  });
});
