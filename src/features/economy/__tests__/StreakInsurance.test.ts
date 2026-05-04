import {
  checkInsuranceStatus,
  purchaseInsurance,
  consumeInsurance,
  INSURANCE_COST_GEMS,
  type PurchaseInsuranceInput,
  type CheckInsuranceStatusInput,
  type ConsumeInsuranceInput,
} from '../StreakInsurance';
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
  { virtual: true }
);

jest.mock('../spending-service', () => ({
  spendCurrency: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));

jest.mock('../analytics', () => ({
  trackInsurancePurchased: jest.fn(),
  trackInsuranceConsumed: jest.fn(),
}));

const USER_ID = '00000000-0000-4000-8000-000000000001';
const INSURANCE_ID = '00000000-0000-4000-8000-000000000010';

describe('StreakInsurance', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-30T12:00:00.000Z'));
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: () => INSURANCE_ID },
    });
    jest.mocked(spendCurrency).mockResolvedValue({
      success: true,
      newBalance: 1000,
      transaction: null,
      error: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('purchaseInsurance deducts 500 gems via atomic transaction', async () => {
    const input: PurchaseInsuranceInput = {
      userId: USER_ID,
      currentStreakDays: 7,
    };

    const result = await purchaseInsurance(input);

    expect(result.success).toBe(true);
    expect(result.insuranceId).toBe(INSURANCE_ID);
    expect(spendCurrency).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        currency: 'GEMS',
        amount: INSURANCE_COST_GEMS,
        sink: 'STREAK_INSURANCE',
      })
    );
  });

  it('purchaseInsurance fails when gem balance < 500', async () => {
    jest.mocked(spendCurrency).mockResolvedValueOnce({
      success: false,
      newBalance: 200,
      transaction: null,
      error: {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient gems',
        recoverable: false,
      },
    });

    const input: PurchaseInsuranceInput = {
      userId: USER_ID,
      currentStreakDays: 7,
    };

    const result = await purchaseInsurance(input);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INSUFFICIENT_FUNDS');
  });

  it('checkInsuranceStatus returns active when insurance exists and not expired', async () => {
    // First purchase insurance
    const purchaseInput: PurchaseInsuranceInput = {
      userId: USER_ID,
      currentStreakDays: 7,
    };
    await purchaseInsurance(purchaseInput);

    // Then check status
    const statusInput: CheckInsuranceStatusInput = { userId: USER_ID };
    const status = await checkInsuranceStatus(statusInput);

    expect(status.hasActiveInsurance).toBe(true);
    expect(status.daysRemaining).toBe(7);
    expect(status.canPurchase).toBe(false);
  });

  it('checkInsuranceStatus returns inactive when expired', async () => {
    // Purchase insurance
    const purchaseInput: PurchaseInsuranceInput = {
      userId: USER_ID,
      currentStreakDays: 7,
    };
    await purchaseInsurance(purchaseInput);

    // Advance time past expiration (8 days)
    jest.setSystemTime(new Date('2026-05-08T12:00:01.000Z'));

    const statusInput: CheckInsuranceStatusInput = { userId: USER_ID };
    const status = await checkInsuranceStatus(statusInput);

    expect(status.hasActiveInsurance).toBe(false);
    expect(status.daysRemaining).toBe(0);
    expect(status.canPurchase).toBe(true);
  });

  it('consumeInsurance fires EventBus streak:restore event', async () => {
    // Purchase insurance first
    const purchaseInput: PurchaseInsuranceInput = {
      userId: USER_ID,
      currentStreakDays: 10,
    };
    await purchaseInsurance(purchaseInput);

    // Consume insurance
    const consumeInput: ConsumeInsuranceInput = {
      userId: USER_ID,
      streakToRestore: 10,
    };
    const result = await consumeInsurance(consumeInput);

    expect(result.success).toBe(true);
    expect(result.restoredDays).toBe(10);
    expect(eventBus.publish).toHaveBeenCalledWith(
      'economy:insurance_consumed',
      expect.objectContaining({
        userId: USER_ID,
        restoredStreakDays: 10,
      })
    );
  });

  it('consumeInsurance marks insurance as consumed — cannot be reused', async () => {
    // Purchase and consume
    await purchaseInsurance({ userId: USER_ID, currentStreakDays: 7 });
    await consumeInsurance({ userId: USER_ID, streakToRestore: 7 });

    // Try to consume again
    const secondConsume = await consumeInsurance({
      userId: USER_ID,
      streakToRestore: 7,
    });

    expect(secondConsume.success).toBe(false);
    expect(secondConsume.error).toBe('Insurance already consumed');
  });

  it('canPurchase is false when active insurance exists', async () => {
    // Purchase insurance
    await purchaseInsurance({ userId: USER_ID, currentStreakDays: 7 });

    // Check status
    const status = await checkInsuranceStatus({ userId: USER_ID });

    expect(status.canPurchase).toBe(false);
    expect(status.reasonCannotPurchase).toBe('You already have active insurance');
  });

  it('returns correct hours remaining for active insurance', async () => {
    // Purchase insurance
    await purchaseInsurance({ userId: USER_ID, currentStreakDays: 7 });

    // Advance 12 hours
    jest.setSystemTime(new Date('2026-04-30T23:59:00.000Z'));

    const status = await checkInsuranceStatus({ userId: USER_ID });

    expect(status.hasActiveInsurance).toBe(true);
    expect(status.daysRemaining).toBe(6);
    expect(status.hoursRemaining).toBeGreaterThan(0);
    expect(status.hoursRemaining).toBeLessThanOrEqual(168); // 7 days in hours
  });
});
