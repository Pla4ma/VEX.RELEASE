/**
 * StreakFuneralScreen test — source removed.
 * Test kept as xdescribe placeholder for documentation.
 */
jest.mock('../streaks/StreakFuneralScreen', () => ({
  StreakFuneralScreen: () => null,
  calculateRestoreCost: () => 100,
  RESTORE_COSTS: { SHORT: 100, MEDIUM: 200, LONG: 500 },
}));

xdescribe('StreakFuneralScreen (disabled)', () => {
  it('feature: streak funeral screen removed', () => { expect(true).toBe(true); });
});
