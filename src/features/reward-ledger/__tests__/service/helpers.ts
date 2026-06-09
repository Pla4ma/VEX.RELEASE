import { describe} from '@jest/globals';

jest.mock('../../repository');
jest.mock('../../../../config/sentry', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

import * as repository from '../../repository';
import { captureException } from '../../../../config/sentry';
import {
  createReward,
  deliverReward,
  failReward,
  expireReward,
  syncPendingRewards,
} from '../../service';
import type { CreateRewardLedgerInput, RewardLedgerRecord } from '../../types';

export {
  repository,
  captureException,
  createReward,
  deliverReward,
  failReward,
  expireReward,
  syncPendingRewards,
};
export type { CreateRewardLedgerInput, RewardLedgerRecord };

export const mockRecord: RewardLedgerRecord = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  idempotencyKey: 'evt_session_complete_001',
  rewardType: 'session_bonus',
  amount: 50,
  currency: 'XP',
  status: 'pending',
  sourceEvent: 'session:completed',
  createdAt: '2026-01-01T00:00:00.000Z',
  deliveredAt: null,
  failedReason: null,
  expiresAt: null,
};

export const validInput: CreateRewardLedgerInput = {
  userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  idempotencyKey: 'evt_session_complete_001',
  rewardType: 'session_bonus',
  amount: 50,
  currency: 'XP',
  sourceEvent: 'session:completed',
};
