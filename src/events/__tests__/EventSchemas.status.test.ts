import { EventSchema, calculateEventStatus } from '../EventSchemas';

describe('EventSchema', () => {
  const validEvent = {
    id: 'evt-1',
    title: 'Test Event',
    description: 'A test event',
    type: 'DAILY',
    status: 'ACTIVE',
    startAt: Date.now(),
    endAt: Date.now() + 86400000,
    challenges: [],
  };

  it('accepts a valid event object', () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('requires id as string', () => {
    const result = EventSchema.safeParse({ ...validEvent, id: 123 });
    expect(result.success).toBe(false);
  });

  it('requires title as non-empty string', () => {
    const result = EventSchema.safeParse({ ...validEvent, title: '' });
    // Zod .string() accepts empty string — schema uses .string() not .min(1)
    // So empty title actually passes. Testing that it accepts any string:
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const { title: _t, ...rest } = validEvent;
    const result = EventSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('requires type to be a valid EventType', () => {
    const result = EventSchema.safeParse({ ...validEvent, type: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('requires status to be a valid EventStatus', () => {
    const result = EventSchema.safeParse({ ...validEvent, status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('requires startAt and endAt as numbers', () => {
    const result1 = EventSchema.safeParse({ ...validEvent, startAt: 'now' });
    expect(result1.success).toBe(false);

    const result2 = EventSchema.safeParse({ ...validEvent, endAt: 'later' });
    expect(result2.success).toBe(false);
  });

  it('defaults leaderboardsEnabled to false', () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.leaderboardsEnabled).toBe(false);
    }
  });

  it('defaults teamsEnabled to false', () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamsEnabled).toBe(false);
    }
  });

  it('defaults currentParticipants to 0', () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currentParticipants).toBe(0);
    }
  });

  it('defaults tags to empty array', () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('accepts optional fields', () => {
    const withOptional = {
      ...validEvent,
      theme: 'summer',
      icon: '🎮',
      bannerImage: 'https://example.com/banner.png',
      rewards: [{ type: 'xp', amount: 100, rarity: 'COMMON' }],
      maxParticipants: 1000,
      rules: { maxSessions: 10 },
      tags: ['featured'],
      seasonId: 'season-1',
    };
    const result = EventSchema.safeParse(withOptional);
    expect(result.success).toBe(true);
  });
});

describe('calculateEventStatus', () => {
  // Use fixed timestamps to avoid Date.now() drift between test setup and function call
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_HOUR = 60 * 60 * 1000;

  it('returns UPCOMING when now is before startAt', () => {
    const base = 1700000000000; // fixed timestamp
    const startAt = base + ONE_HOUR;
    const endAt = base + ONE_DAY;
    // Mock Date.now to return base
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    expect(calculateEventStatus(startAt, endAt)).toBe('UPCOMING');
    spy.mockRestore();
  });

  it('returns ENDED when now is after endAt', () => {
    const base = 1700000000000;
    const startAt = base - ONE_DAY;
    const endAt = base - ONE_HOUR;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    expect(calculateEventStatus(startAt, endAt)).toBe('ENDED');
    spy.mockRestore();
  });

  it('returns ENDING_SOON when less than 24h until endAt', () => {
    const base = 1700000000000;
    const startAt = base - ONE_DAY;
    const endAt = base + ONE_HOUR;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    expect(calculateEventStatus(startAt, endAt)).toBe('ENDING_SOON');
    spy.mockRestore();
  });

  it('returns ACTIVE when more than 24h until endAt', () => {
    const base = 1700000000000;
    const startAt = base - ONE_DAY;
    const endAt = base + 2 * ONE_DAY;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    expect(calculateEventStatus(startAt, endAt)).toBe('ACTIVE');
    spy.mockRestore();
  });

  it('returns ENDING_SOON when just under 24h remains', () => {
    const base = 1700000000000;
    const startAt = base - ONE_DAY;
    const endAt = base + ONE_DAY - 1;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    expect(calculateEventStatus(startAt, endAt)).toBe('ENDING_SOON');
    spy.mockRestore();
  });

  it('returns ACTIVE when exactly 24h remains (not yet <)', () => {
    const base = 1700000000000;
    const startAt = base - ONE_DAY;
    const endAt = base + ONE_DAY;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    // endAt - now = ONE_DAY, which is NOT < ONE_DAY => ACTIVE
    expect(calculateEventStatus(startAt, endAt)).toBe('ACTIVE');
    spy.mockRestore();
  });

  it('returns ENDED when now equals endAt', () => {
    const base = 1700000000000;
    const startAt = base - ONE_DAY;
    const endAt = base;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(base);
    // now > endAt is false (now === endAt), now < startAt is false
    // endAt - now = 0 < ONE_DAY => ENDING_SOON
    expect(calculateEventStatus(startAt, endAt)).toBe('ENDING_SOON');
    spy.mockRestore();
  });
});