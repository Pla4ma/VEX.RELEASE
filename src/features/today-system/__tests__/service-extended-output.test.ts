import { buildTodaySystem } from '../service';

describe('today system — extended output and schema', () => {
  it('always returns exactly 4 sections', () => {
    const system = buildTodaySystem({
      lane: 'minimal_normal',
    });
    expect(system.sections.length).toBe(4);
  });

  it('always includes all section keys', () => {
    const system = buildTodaySystem({
      lane: 'minimal_normal',
    });
    const keys = system.sections.map((s) => s.key);
    expect(keys).toContain('now');
    expect(keys).toContain('later');
    expect(keys).toContain('done');
    expect(keys).toContain('recovery');
  });

  it('includes lane in output', () => {
    const system = buildTodaySystem({
      lane: 'game_like',
    });
    expect(system.lane).toBe('game_like');
  });

  it('accepts zero completedToday', () => {
    expect(() =>
      buildTodaySystem({
        lane: 'minimal_normal',
        completedToday: 0,
      }),
    ).not.toThrow();
  });

  it('accepts large completedToday', () => {
    expect(() =>
      buildTodaySystem({
        lane: 'minimal_normal',
        completedToday: 100,
      }),
    ).not.toThrow();
  });

  it('accepts empty hiddenFeatureKeys', () => {
    expect(() =>
      buildTodaySystem({
        lane: 'minimal_normal',
        hiddenFeatureKeys: [],
      }),
    ).not.toThrow();
  });
});
