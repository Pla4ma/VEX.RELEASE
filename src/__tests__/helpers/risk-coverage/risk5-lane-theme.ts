import { resolveLaneCopy, baseLaneProfile } from './helpers';
import type { Lane } from './helpers';

describe('Risk 5 — Lane Theme Progression', () => {
  it('DAY_0: all four modes unique laneStageThemes', () => {
    const themes: Record<Lane, string> = {} as Record<Lane, string>;
    for (const lane of [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const) {
      themes[lane] = resolveLaneCopy(
        'DAY_0_NOT_STARTED',
        baseLaneProfile({ primaryLane: lane }),
        'fallback',
      ).laneStageTheme;
    }
    expect(themes.student).toBe('first_study_block');
    expect(themes.game_like).toBe('first_focus_run');
    expect(themes.deep_creative).toBe('first_project_block');
    expect(themes.minimal_normal).toBe('first_clean_session');
  });

  it('DAY_1-7: laneStageTheme uses public-facing lane names', () => {
    const pn: Record<Lane, string> = {
      student: 'study',
      game_like: 'run',
      deep_creative: 'project',
      minimal_normal: 'clean',
    };
    for (const lane of [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });
      const d1 = resolveLaneCopy('DAY_1_RETURN', profile, 'fallback');
      expect(d1.laneStageTheme).toBe(`${pn[lane]}_return`);
      const d2 = resolveLaneCopy('DAY_2_PROGRESS_PROOF', profile, 'fallback');
      expect(d2.laneStageTheme).toBe(`${pn[lane]}_proof`);
      const d3 = resolveLaneCopy(
        'DAY_3_COMPANION_CONNECTION',
        profile,
        'fallback',
      );
      expect(d3.laneStageTheme).toBe(`${pn[lane]}_companion_preview`);
      const d7 = resolveLaneCopy('DAY_7_DEEPER_MODE', profile, 'fallback');
      expect(d7.laneStageTheme).toBe(`${pn[lane]}_weekly_intelligence`);
    }
  });

  it('full student progression: all stages correct', () => {
    const stages: string[] = [];
    const profile = baseLaneProfile({ primaryLane: 'student' });
    for (const stage of [
      'DAY_0_NOT_STARTED',
      'DAY_1_RETURN',
      'DAY_2_PROGRESS_PROOF',
      'DAY_3_COMPANION_CONNECTION',
      'DAY_5_PATH_FORMING',
      'DAY_7_DEEPER_MODE',
    ] as const) {
      stages.push(
        `${stage}:${resolveLaneCopy(stage, profile, 'fallback').laneStageTheme}`,
      );
    }
    expect(stages).toEqual([
      'DAY_0_NOT_STARTED:first_study_block',
      'DAY_1_RETURN:study_return',
      'DAY_2_PROGRESS_PROOF:study_proof',
      'DAY_3_COMPANION_CONNECTION:study_companion_preview',
      'DAY_5_PATH_FORMING:student_path_forming',
      'DAY_7_DEEPER_MODE:study_weekly_intelligence',
    ]);
  });
});
