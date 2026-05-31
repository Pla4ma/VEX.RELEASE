import { getDurationBucket } from '../service';

describe('getDurationBucket', () => {
  it.each([
    [0, '10'],
    [600, '10'],
    [749, '10'],
    [750, '15'],
    [1199, '15'],
    [1200, '25'],
    [2099, '25'],
    [2100, '45'],
    [3299, '45'],
    [3300, '60+'],
    [7200, '60+'],
  ] as const)("maps %i seconds to bucket '%s'", (seconds, expected) => {
    expect(getDurationBucket(seconds)).toBe(expected);
  });
});
