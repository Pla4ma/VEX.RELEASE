import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '..', 'VipPaywallScreen.tsx'), 'utf8');

describe('VipPaywallScreen copy', () => {
  it('sells insight and growth instead of daily currency incentives', () => {
    expect(source).toContain('Unlimited AI coach conversations');
    expect(source).toContain('Monthly Focus Report');
    expect(source).toContain('Advanced analytics');
    expect(source).not.toMatch(/Daily Gem Drop|gems\/day|2x Mystery Chests|2x chests/i);
  });

  it('uses the approved purchase failure message', () => {
    expect(source).toContain("Purchase didn't go through. Your card was not charged.");
  });
});
