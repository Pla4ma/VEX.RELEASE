import {
  formatDuration,
  formatDurationFromMs,
  formatDurationColon,
} from '../format-duration';

describe('formatDuration', () => {
  it('formats minutes only when under an hour', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(3540)).toBe('59m');
  });

  it('formats hours and minutes when over an hour', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3660)).toBe('1h 1m');
    expect(formatDuration(7200)).toBe('2h 0m');
    expect(formatDuration(7320)).toBe('2h 2m');
  });

  it('handles exact hour boundaries', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(7200)).toBe('2h 0m');
  });
});

describe('formatDurationFromMs', () => {
  it('converts milliseconds to duration string', () => {
    expect(formatDurationFromMs(60000)).toBe('1m');
    expect(formatDurationFromMs(3600000)).toBe('1h 0m');
  });

  it('truncates partial seconds', () => {
    expect(formatDurationFromMs(59999)).toBe('0m');
  });
});

describe('formatDurationColon', () => {
  it('formats as mm:ss when under an hour', () => {
    expect(formatDurationColon(60)).toBe('1:00');
    expect(formatDurationColon(90)).toBe('1:30');
    expect(formatDurationColon(3599)).toBe('59:59');
  });

  it('formats as h:mm:ss when over an hour', () => {
    expect(formatDurationColon(3600)).toBe('1:00:00');
    expect(formatDurationColon(3661)).toBe('1:01:01');
    expect(formatDurationColon(7200)).toBe('2:00:00');
  });

  it('pads minutes and seconds with zeros', () => {
    expect(formatDurationColon(61)).toBe('1:01');
    expect(formatDurationColon(3601)).toBe('1:00:01');
  });

  it('handles zero', () => {
    expect(formatDurationColon(0)).toBe('0:00');
  });
});
