import {
  getInsuranceStatus,
  consumeInsurance,
} from '../StreakInsurance';

describe('getInsuranceStatus', () => {
  it('returns not insured with 0 days remaining', () => {
    const status = getInsuranceStatus();
    expect(status.isInsured).toBe(false);
    expect(status.daysRemaining).toBe(0);
  });
});

describe('consumeInsurance', () => {
  it('returns failed status', async () => {
    const result = await consumeInsurance({
      userId: 'user-1',
      insuranceId: 'ins-1',
    });
    expect(result.isInsured).toBe(false);
    expect(result.daysRemaining).toBe(0);
    expect(result.success).toBe(false);
    expect(result.restoredDays).toBe(0);
  });
});
