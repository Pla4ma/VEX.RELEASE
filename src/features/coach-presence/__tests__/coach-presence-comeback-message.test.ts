/**
 * Coach Presence — Comeback Message Tests
 */

import { getCoachComebackMessage } from '../comeback-message';

describe('getCoachComebackMessage', () => {
  test('returns calm style message', () => {
    const msg = getCoachComebackMessage({ motivationStyle: 'CALM', daysSinceLastSession: 3 });
    expect(msg).toContain('3 days');
    expect(msg).toContain('no pressure');
  });

  test('returns intense style message', () => {
    const msg = getCoachComebackMessage({ motivationStyle: 'INTENSE', daysSinceLastSession: 2 });
    expect(msg).toContain('2');
    expect(msg).toContain('Prove it');
  });

  test('returns game_like style message', () => {
    const msg = getCoachComebackMessage({ motivationStyle: 'GAME_LIKE', daysSinceLastSession: 5 });
    expect(msg).toContain('5 days off');
  });

  test('returns calm style message for unknown style (fallback)', () => {
    const msg = getCoachComebackMessage({ motivationStyle: 'UNKNOWN', daysSinceLastSession: 1 });
    expect(msg).toContain('Welcome back');
    expect(msg).toContain('no pressure');
  });
});
