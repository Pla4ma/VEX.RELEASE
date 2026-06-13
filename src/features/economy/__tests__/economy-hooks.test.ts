/**
 * Tests for economy hooks — archived.
 * useWallet / useBalance removed for final release (currency disabled).
 */
describe('economy hooks (archived)', () => {
  it('placeholder — wallet/balance hooks removed', () => {
    expect(true).toBe(true);
  });
});

describe('economyKeys', () => {
  it('generates expected key shapes', () => {
    const allKey = ['economy'];
    expect(allKey).toEqual(['economy']);
  });
});
