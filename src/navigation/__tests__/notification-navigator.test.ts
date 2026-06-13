import { isValidNotificationAction } from '../notification-navigator';

describe('isValidNotificationAction', () => {
  it('returns true for valid action types', () => {
    expect(isValidNotificationAction({ type: 'start_session' })).toBe(true);
    expect(isValidNotificationAction({ type: 'view_progress' })).toBe(true);
    expect(isValidNotificationAction({ type: 'view_boss' })).toBe(true);
    expect(isValidNotificationAction({ type: 'open_coach' })).toBe(true);
    expect(isValidNotificationAction({ type: 'custom' })).toBe(true);
  });

  it('returns true for valid actions with payload', () => {
    expect(isValidNotificationAction({ type: 'start_session', payload: { presetId: 'p1' } })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidNotificationAction(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidNotificationAction(undefined)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isValidNotificationAction('string')).toBe(false);
    expect(isValidNotificationAction(123)).toBe(false);
  });

  it('returns false for objects without type', () => {
    expect(isValidNotificationAction({ payload: {} })).toBe(false);
    expect(isValidNotificationAction({})).toBe(false);
  });

  it('returns false for invalid type values', () => {
    expect(isValidNotificationAction({ type: 'invalid_type' })).toBe(false);
    expect(isValidNotificationAction({ type: '' })).toBe(false);
  });

  it('returns false for objects with non-string type', () => {
    expect(isValidNotificationAction({ type: 123 })).toBe(false);
    expect(isValidNotificationAction({ type: null })).toBe(false);
  });
});
