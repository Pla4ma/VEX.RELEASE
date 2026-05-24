import { getStarterPresetsForDisplay } from '../starter-presets';

describe('getStarterPresetsForDisplay', () => {
  it('keeps the first-session default focused on short sessions', () => {
    const presets = getStarterPresetsForDisplay(false);

    expect(presets.map((preset) => preset.id)).toEqual(['quick', 'pomodoro']);
  });

  it('reveals longer sessions only after the user asks for more options', () => {
    const presets = getStarterPresetsForDisplay(true);

    expect(presets.map((preset) => preset.id)).toContain('deep');
  });
});
