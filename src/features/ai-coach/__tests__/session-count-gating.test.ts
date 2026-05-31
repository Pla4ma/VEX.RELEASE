import { canClaimStrongPattern } from '../CoachMemory';

describe('Session count gating', () => {
  it('canClaimStrongPattern returns false before 3 sessions', () => {
    expect(canClaimStrongPattern(0)).toBe(false);
    expect(canClaimStrongPattern(1)).toBe(false);
    expect(canClaimStrongPattern(2)).toBe(false);
  });

  it('canClaimStrongPattern returns true after 3 sessions', () => {
    expect(canClaimStrongPattern(3)).toBe(true);
    expect(canClaimStrongPattern(10)).toBe(true);
  });
});
