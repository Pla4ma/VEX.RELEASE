import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '..', 'VipPaywallScreen.tsx'), 'utf8');

describe('VipPaywallScreen copy', () => {
  it('sells insight and growth instead of daily currency incentives', () => {
    expect(source).toContain('Deep Coach Memory');
    expect(source).toContain('Monthly Focus Report');
    expect(source).toContain('Progress Intelligence');
    expect(source).not.toMatch(/Daily Gem Drop|gems\/day|2x Mystery Chests|2x chests/i);
    expect(source).not.toMatch(/season track|extra personal quests/i);
  });

  it('uses the approved purchase failure message', () => {
    expect(source).toContain("Purchase didn't go through. Your card was not charged.");
  });
});
