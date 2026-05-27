import { buildRescueDeepLink, isRescueDeepLinkValid } from './helpers';

describe('notification policy — deep link validation', () => {
  it('builds valid rescue deep link', () => {
    const link = buildRescueDeepLink('plan-1', 'Review notes', 600);
    expect(link.type).toBe('start_rescue');
    expect(link.payload.rescuePlanId).toBe('plan-1');
    expect(link.payload.suggestedDurationSeconds).toBe(600);
  });

  it('validates correct rescue deep link', () => {
    const link = buildRescueDeepLink('plan-2', 'Do 5 min', 300);
    expect(isRescueDeepLinkValid(link)).toBe(true);
  });

  it('rejects invalid deep link shapes', () => {
    expect(isRescueDeepLinkValid(null)).toBe(false);
    expect(isRescueDeepLinkValid(undefined)).toBe(false);
    expect(isRescueDeepLinkValid({})).toBe(false);
    expect(isRescueDeepLinkValid({ type: 'wrong' })).toBe(false);
    expect(isRescueDeepLinkValid({ type: 'start_rescue' })).toBe(false);
    expect(isRescueDeepLinkValid({ type: 'start_rescue', payload: null })).toBe(false);
  });
});
