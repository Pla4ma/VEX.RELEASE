import type { WalletSummary, SpendError, SpendErrorCode } from '../types';

describe('economy types', () => {
  it('WalletSummary has coins and gems', () => {
    const wallet: WalletSummary = { coins: 100, gems: 5 };
    expect(wallet.coins).toBe(100);
    expect(wallet.gems).toBe(5);
  });

  it('SpendError has code and message', () => {
    const error: SpendError = {
      code: 'INSUFFICIENT_BALANCE',
      message: 'Not enough coins',
    };
    expect(error.code).toBe('INSUFFICIENT_BALANCE');
  });

  it('SpendErrorCode includes all expected values', () => {
    const codes: SpendErrorCode[] = [
      'INSUFFICIENT_BALANCE',
      'INVALID_CURRENCY',
      'DB_ERROR',
    ];
    expect(codes).toHaveLength(3);
  });
});
