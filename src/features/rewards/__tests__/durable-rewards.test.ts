import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockCreateLedgerReward = jest.fn(async () => ({ id: 'ledger-id' }));
const mockDeliverReward = jest.fn(async () => undefined);

jest.mock('../../reward-ledger/service', () => ({
  createReward: (input: unknown) => mockCreateLedgerReward(input),
  deliverReward: (ledgerId: string) => mockDeliverReward(ledgerId),
}));

import { claimReward, createReward } from '../service';

const userId = '00000000-0000-4000-8000-000000000001';

describe('durable rewards', () => {
  beforeEach(() => {
    mockCreateLedgerReward.mockClear();
    mockDeliverReward.mockClear();
  });

  it('persists a reward ledger entry instead of synthesizing an id', async () => {
    const result = await createReward({
      amount: 100,
      idempotencyKey: 'session-key:reward',
      triggerType: 'SESSION_COMPLETE',
      type: 'XP',
      userId,
    });

    expect(result).toEqual({ id: 'ledger-id' });
    expect(mockCreateLedgerReward).toHaveBeenCalledWith({
      amount: 100,
      currency: 'XP',
      idempotencyKey: 'session-key:reward',
      rewardType: 'XP',
      sourceEvent: 'SESSION_COMPLETE',
      userId,
    });
  });

  it('delivers a persisted reward by ledger id', async () => {
    await claimReward('ledger-id');

    expect(mockDeliverReward).toHaveBeenCalledWith('ledger-id');
  });
});
