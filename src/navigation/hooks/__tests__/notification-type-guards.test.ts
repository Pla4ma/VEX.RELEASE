import {
  isHiddenV1Type,
  getNotificationType,
  getErrorMessage,
  notificationTypeToAction,
} from '../notification-type-guards';

describe('isHiddenV1Type', () => {
  it('returns true for hidden v1 notification types', () => {
    expect(isHiddenV1Type('squad_war_start')).toBe(true);
    expect(isHiddenV1Type('squad_war_end')).toBe(true);
    expect(isHiddenV1Type('rival_challenge')).toBe(true);
    expect(isHiddenV1Type('shop_new_items')).toBe(true);
    expect(isHiddenV1Type('battle_pass_tier')).toBe(true);
    expect(isHiddenV1Type('guild_event')).toBe(true);
  });

  it('returns false for non-hidden types', () => {
    expect(isHiddenV1Type('boss_encounter')).toBe(false);
    expect(isHiddenV1Type('mastery_rank_up')).toBe(false);
    expect(isHiddenV1Type('unknown_type')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isHiddenV1Type('')).toBe(false);
  });
});

describe('getNotificationType', () => {
  it('returns type from data object', () => {
    expect(getNotificationType({ type: 'boss_encounter' })).toBe('boss_encounter');
  });

  it('returns "unknown" when type is missing', () => {
    expect(getNotificationType({})).toBe('unknown');
  });

  it('returns "unknown" when type is not a string', () => {
    expect(getNotificationType({ type: 123 })).toBe('unknown');
    expect(getNotificationType({ type: null })).toBe('unknown');
  });
});

describe('getErrorMessage', () => {
  it('returns message from Error objects', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('stringifies non-Error values', () => {
    expect(getErrorMessage('string error')).toBe('string error');
    expect(getErrorMessage(42)).toBe('42');
  });
});

describe('notificationTypeToAction', () => {
  it('maps boss types to view_boss', () => {
    expect(notificationTypeToAction('boss_timeout_warning', {}).type).toBe('view_boss');
    expect(notificationTypeToAction('boss_encounter', {}).type).toBe('view_boss');
    expect(notificationTypeToAction('boss_defeated', {}).type).toBe('view_boss');
  });

  it('maps squad war types to view_squad', () => {
    expect(notificationTypeToAction('squad_war_start', {}).type).toBe('view_squad');
    expect(notificationTypeToAction('squad_war_end', {}).type).toBe('view_squad');
    expect(notificationTypeToAction('squad_war_reminder', {}).type).toBe('view_squad');
  });

  it('maps mastery_rank_up to custom Mastery', () => {
    const action = notificationTypeToAction('mastery_rank_up', {});
    expect(action.type).toBe('custom');
    expect(action.payload?.screen).toBe('Mastery');
  });

  it('maps unknown types to custom Home', () => {
    const action = notificationTypeToAction('something_random', {});
    expect(action.type).toBe('custom');
    expect(action.payload?.screen).toBe('Home');
  });
});
