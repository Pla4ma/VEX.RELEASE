/**
 * Phase 3A — Lane Pipeline Audit
 */

import type { Lane, LaneMechanicPolicy } from '../../../features/lane-engine/types';
import {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
  decideNudge,
  baseLaneProfile,
  auditLane,
} from './helpers';

describe('Phase 3A — Lane Pipeline Audit', () => {
  it('audit table: all four modes produce distinct profiles', () => {
    const results: Record<Lane, string> = {} as Record<Lane, string>;
    for (const lane of [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const) {
      results[lane] = auditLane(lane);
    }

    const modes = Object.values(results);
    const modeLines = modes.map((m) => m.match(/Session mode: (\w+)/)?.[1]);
    const uniqueModes = new Set(modeLines);
    expect(uniqueModes.size).toBe(4);

    const themes = modes.map((m) => m.match(/Day 0 surface: (\w+)/)?.[1]);
    const uniqueThemes = new Set(themes);
    expect(uniqueThemes.size).toBe(4);

    expect(results.student).toContain('first_study_block');
    expect(results.game_like).toContain('first_focus_run');
    expect(results.deep_creative).toContain('first_project_block');
    expect(results.minimal_normal).toContain('first_clean_session');
  });

  it('audit table: mechanism policies match locked decisions', () => {
    const policies: Record<Lane, LaneMechanicPolicy> = {
      student: getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: 'student' }),
      ),
      game_like: getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: 'game_like' }),
      ),
      deep_creative: getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: 'deep_creative' }),
      ),
      minimal_normal: getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: 'minimal_normal' }),
      ),
    };

    expect(policies.student.preferredMechanics).toContain('study_os');
    expect(policies.minimal_normal.blockedMechanics).toContain('blocker_full_cta');
    expect(policies.minimal_normal.blockedMechanics).toContain('xp_first_ui');
    expect(policies.game_like.preferredMechanics).toContain('personal_blocker');
    expect(policies.deep_creative.preferredMechanics).toContain(
      'project_thread',
    );
  });

  it('audit table: Clean notification budget is max 1/day', () => {
    const cleanNudge = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
    });
    expect(cleanNudge.allowed).toBe(false);
    expect(cleanNudge.budgetRemaining).toBe(0);

    const studyNudge = decideNudge({
      lane: 'student',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
    });
    expect(studyNudge.allowed).toBe(true);
    expect(studyNudge.budgetRemaining).toBe(1);
  });

  it('audit table: presentation policy maps Clean to minimal animation', () => {
    const cleanPres = getLanePresentationPolicy({
      lane: 'minimal_normal',
      reducedMotion: false,
    });
    expect(cleanPres.animation).toBe('minimal');

    const runPres = getLanePresentationPolicy({
      lane: 'game_like',
      reducedMotion: false,
    });
    expect(runPres.animation).toBe('medium_high');
  });
});
