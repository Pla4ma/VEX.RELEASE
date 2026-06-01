import { markExpiredAsIgnored } from './helpers';

describe('notification policy — ignored tracking', () => {
  it('marks expired sent record as ignored after 30 min', () => {
    const result = markExpiredAsIgnored(
      'user-1',
      'student',
      Date.now() - 31 * 60 * 1000,
    );
    expect(result).toHaveLength(1);
    expect(result[0].signal).toBe('ignored');
    expect(result[0].userId).toBe('user-1');
    expect(result[0].lane).toBe('student');
  });

  it('does not mark recent sent record as ignored', () => {
    const result = markExpiredAsIgnored('user-2', 'game_like', Date.now());
    expect(result).toHaveLength(0);
  });

  it('marks expired signals from record array as ignored', () => {
    const records = [
      {
        userId: 'u3',
        nudgeType: 'gentle_return' as const,
        signal: 'sent' as const,
        lane: 'student' as const,
        occurredAt: Date.now() - 40 * 60 * 1000,
      },
      {
        userId: 'u3',
        nudgeType: 'gentle_return' as const,
        signal: 'sent' as const,
        lane: 'student' as const,
        occurredAt: Date.now() - 5 * 60 * 1000,
      },
    ];
    const result = markExpiredAsIgnored('u3', 'student', records);
    expect(result).toHaveLength(1);
    expect(result[0].signal).toBe('ignored');
  });
});
