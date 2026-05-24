import {
  buildSquadCode,
  buildSquadShareMessage,
  getEmptyWeeklyStats,
} from '../share';

describe('squad share helpers', () => {
  it('builds stable invite codes from the squad id prefix', () => {
    expect(buildSquadCode('12345678-90ab-cdef-1234-567890abcdef')).toBe('12345678');
  });

  it('includes squad name, weekly focus hours, and invite path in the share message', () => {
    const message = buildSquadShareMessage(
      { name: 'Deep Work Crew' },
      { activeMemberCount: 3, totalFocusMinutes: 186, totalSessions: 9 },
      'abc12345',
    );

    expect(message).toBe(
      'My squad Deep Work Crew just hit 3h of focus this week on VEX. Join us: vex.app/squad/abc12345',
    );
  });

  it('returns a zeroed weekly stats fallback for offline or loading states', () => {
    expect(getEmptyWeeklyStats()).toEqual({
      activeMemberCount: 0,
      totalFocusMinutes: 0,
      totalSessions: 0,
    });
  });
});
