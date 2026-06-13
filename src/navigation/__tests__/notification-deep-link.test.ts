import {
  deepLinkToNotificationAction,
} from '../notification-deep-link';
import type { DeepLinkPath } from '../deep-link-types';

describe('deepLinkToNotificationAction', () => {
  it('maps session path to start_session', () => {
    const action = deepLinkToNotificationAction('session', { presetId: 'p1' });
    expect(action.type).toBe('start_session');
    expect(action.payload?.presetId).toBe('p1');
  });

  it('maps boss path to view_boss', () => {
    const action = deepLinkToNotificationAction('boss', {});
    expect(action.type).toBe('view_boss');
  });

  it('maps duels path to join_duel', () => {
    const action = deepLinkToNotificationAction('duels', { duelId: 'd1' });
    expect(action.type).toBe('join_duel');
    expect(action.payload?.duelId).toBe('d1');
  });

  it('maps squad path to view_squad', () => {
    const action = deepLinkToNotificationAction('squad', { squadId: 's1' });
    expect(action.type).toBe('view_squad');
    expect(action.payload?.squadId).toBe('s1');
  });

  it('maps profile path to view_profile', () => {
    const action = deepLinkToNotificationAction('profile', { userId: 'u1' });
    expect(action.type).toBe('view_profile');
    expect(action.payload?.userId).toBe('u1');
  });

  it('maps invite path to accept_invite', () => {
    const action = deepLinkToNotificationAction('invite', { code: 'ABC123' });
    expect(action.type).toBe('accept_invite');
    expect(action.payload?.inviteCode).toBe('ABC123');
  });

  it('maps study path to start_session with STUDY mode', () => {
    const action = deepLinkToNotificationAction('study', {});
    expect(action.type).toBe('start_session');
    expect(action.payload?.presetMode).toBe('STUDY');
    expect(action.payload?.source).toBe('content-study');
  });

  it('maps settings path to view_progress', () => {
    const action = deepLinkToNotificationAction('settings', {});
    expect(action.type).toBe('view_progress');
  });

  it('maps coach path to open_coach', () => {
    const action = deepLinkToNotificationAction('coach', {});
    expect(action.type).toBe('open_coach');
  });

  it('maps shop path to open_shop', () => {
    const action = deepLinkToNotificationAction('shop', {});
    expect(action.type).toBe('open_shop');
  });

  it('maps unknown path to custom', () => {
    const action = deepLinkToNotificationAction('rescue' as DeepLinkPath, { x: '1' });
    expect(action.type).toBe('custom');
    expect(action.payload?.screen).toBe('rescue');
  });
});
