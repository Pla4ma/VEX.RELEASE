import { runAddXpOperation } from '../service-operation';
import { atomicAddXpRpc } from '../repository';
import { publishProgressionEvents } from '../operation-events';
import { calculateXpBreakdown } from '../service-xp-calculations';
import type { AddXpInput } from '../schemas';

jest.mock('../repository', () => ({ atomicAddXpRpc: jest.fn() }));
jest.mock('../operation-events', () => ({ publishProgressionEvents: jest.fn() }));

const input: AddXpInput = { userId: '550e8400-e29b-41d4-a716-446655440000',
  amount: 100, source: 'SESSION_COMPLETE' };
const breakdown = calculateXpBreakdown({ baseAmount: 100, streakDays: 0,
  squadMultiplier: 1, bossActive: false, perfectSession: false, comebackActive: false });

beforeEach(() => jest.clearAllMocks());

it('leaves an ambiguous network award unresolved so the same key can be retried', async (): Promise<void> => {
  jest.mocked(atomicAddXpRpc).mockResolvedValue({ data: null, error: new Error('Lost response') });
  const result = await runAddXpOperation(input.userId, input, breakdown, 1, false, jest.fn(), 'stable-key');
  expect(result).toMatchObject({ success: false, xpAdded: 0, offlineQueued: false,
    error: { retryable: true } });
  expect(publishProgressionEvents).not.toHaveBeenCalled();
  expect(atomicAddXpRpc).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: 'stable-key' }));
});

it('rejects an explicitly unsuccessful server response', async (): Promise<void> => {
  jest.mocked(atomicAddXpRpc).mockResolvedValue({ error: null, data: { success: false,
    duplicate: false, xp_added: 0, new_total_xp: 0, new_level: 1,
    previous_level: 1, level_up: false, rewards: [] } });
  const result = await runAddXpOperation(input.userId, input, breakdown, 1, false, jest.fn(), 'key');
  expect(result.success).toBe(false);
});

it('does not emit a second XP celebration when the server confirms a duplicate', async (): Promise<void> => {
  jest.mocked(atomicAddXpRpc).mockResolvedValue({ error: null, data: { success: true,
    duplicate: true, xp_added: 0, new_total_xp: 301, new_level: 3,
    previous_level: 3, level_up: false, rewards: [] } });
  const result = await runAddXpOperation(input.userId, input, breakdown, 1, false, jest.fn(), 'key');
  expect(result).toMatchObject({ success: true, xpAdded: 0, newLevel: 3 });
  expect(publishProgressionEvents).toHaveBeenCalledWith(true, expect.anything(),
    expect.anything(), expect.anything(), 301, 3, 76, 3, 156, false, []);
});
