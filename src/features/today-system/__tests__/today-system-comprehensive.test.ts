import { buildTodaySystem } from '../service';
import type { TodaySystemInput } from '../schemas';

describe('today system — comprehensive', () => {
  const baseInput: TodaySystemInput = {
    lane: 'minimal_normal',
    completedToday: 0,
    dayFeelsMessy: false,
    hiddenFeatureKeys: [],
    laterAction: null,
    nowAction: null,
    reducedMotion: false,
  };

  it('shows default now section on Day 0', () => {
    const system = buildTodaySystem(baseInput);
    const now = system.sections.find((s) => s.key === 'now');
    expect(now?.visible).toBe(true);
    expect(now?.body).toBe(
      'Name one task. Run the block. That is enough.',
    );
    expect(now?.ctaLabel).toBe('Start clean block');
    expect(now?.durationSeconds).toBe(25 * 60);
  });

  it('hides later section when no later action', () => {
    const system = buildTodaySystem(baseInput);
    const later = system.sections.find((s) => s.key === 'later');
    expect(later?.visible).toBe(false);
  });

  it('shows later section when laterAction provided', () => {
    const system = buildTodaySystem({
      ...baseInput,
      laterAction: {
        id: 'later-1',
        label: 'Review biology notes',
        ctaLabel: 'Start review',
        durationSeconds: 15 * 60,
      },
    });
    const later = system.sections.find((s) => s.key === 'later');
    expect(later?.visible).toBe(true);
    expect(later?.body).toBe('Review biology notes');
    expect(later?.ctaLabel).toBe('Start review');
    expect(later?.durationSeconds).toBe(15 * 60);
  });

  it('shows completed count in done section', () => {
    const system = buildTodaySystem({ ...baseInput, completedToday: 3 });
    const done = system.sections.find((s) => s.key === 'done');
    expect(done?.body).toBe('3 clean blocks banked. Quiet progress.');
  });

  it('shows singular block for completedToday = 1', () => {
    const system = buildTodaySystem({ ...baseInput, completedToday: 1 });
    const done = system.sections.find((s) => s.key === 'done');
    expect(done?.body).toBe('1 clean block banked. Quiet progress.');
  });

  it('shows zero state for done section when none completed', () => {
    const system = buildTodaySystem({ ...baseInput, completedToday: 0 });
    const done = system.sections.find((s) => s.key === 'done');
    expect(done?.body).toBe(
      'Nothing banked yet. The first block is the hardest.',
    );
  });

  it('shows recovery section only when dayFeelsMessy is true', () => {
    const noRecovery = buildTodaySystem(baseInput);
    const recoveryHidden = noRecovery.sections.find(
      (s) => s.key === 'recovery',
    );
    expect(recoveryHidden?.visible).toBe(false);

    const withRecovery = buildTodaySystem({
      ...baseInput,
      dayFeelsMessy: true,
    });
    const recoveryVisible = withRecovery.sections.find(
      (s) => s.key === 'recovery',
    );
    expect(recoveryVisible?.visible).toBe(true);
    expect(recoveryVisible?.durationSeconds).toBe(5 * 60);
    expect(recoveryVisible?.ctaLabel).toBe('Recover');
  });

  it('hides all sections when today_strip is hidden', () => {
    const system = buildTodaySystem({
      ...baseInput,
      hiddenFeatureKeys: ['today_strip'],
    });
    expect(system.sections.every((s) => !s.visible)).toBe(true);
  });

  it('sets animation level to none for reduced motion', () => {
    const system = buildTodaySystem({
      ...baseInput,
      reducedMotion: true,
    });
    expect(system.animationLevel).toBe('none');
  });

  it('sets animation level to subtle for minimal_normal without reduced motion', () => {
    const system = buildTodaySystem(baseInput);
    expect(system.animationLevel).toBe('subtle');
  });

  it('sets animation level to none for non-minimal lanes', () => {
    const system = buildTodaySystem({
      ...baseInput,
      lane: 'student',
    });
    expect(system.animationLevel).toBe('none');
  });

  it('uses custom nowAction when provided', () => {
    const system = buildTodaySystem({
      ...baseInput,
      nowAction: {
        id: 'custom-now',
        label: 'Custom task for today',
        ctaLabel: 'Begin',
        durationSeconds: 30 * 60,
      },
    });
    const now = system.sections.find((s) => s.key === 'now');
    expect(now?.body).toBe('Custom task for today');
    expect(now?.ctaLabel).toBe('Begin');
    expect(now?.durationSeconds).toBe(30 * 60);
  });

  it('always returns exactly 4 sections', () => {
    const system = buildTodaySystem(baseInput);
    expect(system.sections).toHaveLength(4);
    expect(system.sections.map((s) => s.key)).toEqual([
      'now',
      'later',
      'done',
      'recovery',
    ]);
  });

  it('preserves lane in output', () => {
    const system = buildTodaySystem({ ...baseInput, lane: 'student' });
    expect(system.lane).toBe('student');
  });

  it('rejects invalid input', () => {
    expect(() =>
      buildTodaySystem({
        ...baseInput,
        lane: 'invalid_lane' as unknown as TodaySystemInput['lane'],
      }),
    ).toThrow();
  });
});
