import {
  getActiveWagerStatus,
  placeWager,
  resolveWager,
  type PlaceWagerInput,
} from '../StreakWagerService';
import { addCurrency } from '../wallet-service';
import { spendCurrency } from '../spending-service';
import { eventBus } from '../../../events';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

const mockStorage = new Map<string, string>();

jest.mock(
  '../../../store/mmkv-storage',
  () => ({
    storage: {
      set: jest.fn((key: string, value: string) => mockStorage.set(key, value)),
      getString: jest.fn((key: string) => mockStorage.get(key)),
      delete: jest.fn((key: string) => mockStorage.delete(key)),
    },
  }),
  { virtual: true },
);

jest.mock('../spending-service', () => ({
  spendCurrency: jest.fn(),
}));

jest.mock('../wallet-service', () => ({
  addCurrency: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));

jest.mock('../analytics', () => ({
  trackWagerPlaced: jest.fn(),
  trackWagerResolved: jest.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';
const WAGER_ID = '00000000-0000-4000-8000-000000000010';

const baseInput: PlaceWagerInput = {
  userId: USER_ID,
  type: 'SESSIONS_THIS_WEEK',
  currency: 'COINS',
  betAmount: 100,
  hasInsurance: false,
  currentStreakDays: 3,
};

describe('StreakWagerService', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: () => WAGER_ID },
    });
    jest.mocked(spendCurrency).mockResolvedValue({
      success: true,
      newBalance: 900,
      transaction: null,
      error: null,
    });
    jest.mocked(addCurrency).mockResolvedValue({
      newBalance: 1250,
      earnedAmount: 350,
      transaction: {
        id: 'transaction-1',
        walletId: 'wallet-1',
        userId: USER_ID,
        type: 'EARN',
        currency: 'COINS',
        amount: 350,
        balanceBefore: 900,
        balanceAfter: 1250,
        description: 'Wager payout',
        source: 'STREAK',
        sourceId: null,
        metadata: {},
        createdAt: Date.now(),
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('places a wager and deducts the bet from wallet', async () => {
    const result = await placeWager(baseInput);

    expect(result).toEqual({ success: true, wagerId: WAGER_ID, error: null });
    expect(spendCurrency).toHaveBeenCalledWith(expect.objectContaining({
      userId: USER_ID,
      currency: 'COINS',
      amount: 100,
      sink: 'STREAK_WAGER',
    }));
    expect(getActiveWagerStatus(USER_ID).wager?.id).toBe(WAGER_ID);
  });

  it('rejects placement when balance is insufficient', async () => {
    jest.mocked(spendCurrency).mockResolvedValueOnce({
      success: false,
      newBalance: 0,
      transaction: null,
      error: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient coins', recoverable: false },
    });

    const result = await placeWager(baseInput);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INSUFFICIENT_FUNDS');
    expect(getActiveWagerStatus(USER_ID).hasActiveWager).toBe(false);
  });

  it('resolves WIN when target is met and credits multiplied return', async () => {
    await placeWager(baseInput);

    const result = await resolveWager({ userId: USER_ID, wagerId: WAGER_ID, success: true });

    expect(result.status).toBe('WON');
    expect(result.amountReceived).toBe(350);
    expect(addCurrency).toHaveBeenCalledWith(expect.objectContaining({ amount: 350 }));
    expect(eventBus.publish).toHaveBeenCalledWith('economy:wager_resolved', expect.objectContaining({ outcome: 'WIN' }));
  });

  it('resolves LOSS with 50 percent partial refund', async () => {
    await placeWager(baseInput);

    const result = await resolveWager({ userId: USER_ID, wagerId: WAGER_ID, success: false });

    expect(result.status).toBe('LOST');
    expect(result.amountReceived).toBe(50);
    expect(addCurrency).toHaveBeenCalledWith(expect.objectContaining({ amount: 50 }));
    expect(eventBus.publish).toHaveBeenCalledWith('economy:wager_resolved', expect.objectContaining({ outcome: 'LOSS' }));
  });

  it('prevents placing a second wager when one is active', async () => {
    await placeWager(baseInput);

    const result = await placeWager(baseInput);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('ALREADY_ACTIVE');
    expect(spendCurrency).toHaveBeenCalledTimes(1);
  });

  it('does not resolve an already-resolved wager', async () => {
    await placeWager(baseInput);
    await resolveWager({ userId: USER_ID, wagerId: WAGER_ID, success: true });

    const result = await resolveWager({ userId: USER_ID, wagerId: WAGER_ID, success: true });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Wager already resolved');
    expect(addCurrency).toHaveBeenCalledTimes(1);
  });

  it('expires wager after duration_days with no resolution', async () => {
    await placeWager(baseInput);
    jest.setSystemTime(new Date('2026-05-08T12:00:01.000Z'));

    const status = getActiveWagerStatus(USER_ID);

    expect(status.hasActiveWager).toBe(false);
    expect(status.canPlaceNewWager).toBe(true);
  });
});
