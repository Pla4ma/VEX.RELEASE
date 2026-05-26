/**
 * VEX Phase 17 — Journeys: First session setup + Active session (Categories 3 + 4)
 */
import { describe, expect, it } from '@jest/globals';
import { buildLaneSessionBrief } from '../../features/session-start/service';
import { generateSessionRecommendation } from '../../features/session-recommendation/service';
import type { Lane } from '../../features/lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

describe('Phase 17 — First session: Study setup', () => {
  it('builds study session brief with correct mode and copy', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane: 'student', subjectOrTask: 'Biology ch 3' });
    expect(brief.userFacingModeName).toBe('Study');
    expect(brief.sessionMode).toBe('STUDY');
    expect(brief.ctaLabel).toBe('Start study block');
    expect(brief.title).toBe('Study block ready');
  });
  it('includes focus strategy', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 30 * 60, lane: 'student', subjectOrTask: 'Physics' });
    expect(JSON.stringify(brief.focusStrategyLoadout)).toContain('Phone away');
  });
});

describe('Phase 17 — First session: Run setup', () => {
  it('builds encounter brief without currency references', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 15 * 60, lane: 'game_like' });
    expect(brief.userFacingModeName).toBe('Run');
    expect(brief.sessionMode).toBe('SPRINT');
    expect(JSON.stringify(brief)).not.toMatch(/wager|coin|gem|shop|wallet|insurance|bounty/i);
  });
  it('ctaLabel is Start encounter', () => {
    expect(buildLaneSessionBrief({ durationSeconds: 10 * 60, lane: 'game_like' }).ctaLabel).toBe('Start encounter');
  });
});

describe('Phase 17 — First session: Project setup', () => {
  it('builds project brief with creative mode', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 30 * 60, lane: 'deep_creative' });
    expect(brief.userFacingModeName).toBe('Project');
    expect(brief.sessionMode).toBe('CREATIVE');
    expect(brief.ctaLabel).toBe('Resume project block');
  });
});

describe('Phase 17 — First session: Clean setup', () => {
  it('builds clean session brief with light focus', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 15 * 60, lane: 'minimal_normal' });
    expect(brief.userFacingModeName).toBe('Clean');
    expect(brief.sessionMode).toBe('LIGHT_FOCUS');
    expect(brief.ctaLabel).toBe('Start clean session');
  });
  it('clean setup has no gamification or economy references', () => {
    const json = JSON.stringify(buildLaneSessionBrief({ durationSeconds: 10 * 60, lane: 'minimal_normal' }));
    expect(json).not.toMatch(/boss|challenge|quest|wager/i);
  });
});

describe('Phase 17 — Active session: Study target', () => {
  it('has study session mode', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane: 'student', subjectOrTask: 'Chemistry' });
    expect(brief.sessionMode).toBe('STUDY');
    expect(brief.userFacingModeName).toBe('Study');
  });
  it('does not show other lane signals during study', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane: 'student' });
    expect(brief.userFacingModeName).not.toBe('Run');
    expect(brief.userFacingModeName).not.toBe('Project');
    expect(brief.userFacingModeName).not.toBe('Clean');
  });
});

describe('Phase 17 — Active session: Run tiny signal only', () => {
  it('run brief has no economy/currency references', () => {
    const json = JSON.stringify(buildLaneSessionBrief({ durationSeconds: 10 * 60, lane: 'game_like' }));
    ['wager', 'coin', 'gem', 'shop', 'wallet', 'insurance', 'bounty'].forEach((t) => {
      expect(json).not.toMatch(new RegExp(t, 'i'));
    });
  });
});

describe('Phase 17 — Active session: Project next move', () => {
  it('project brief supports task description', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 20 * 60, lane: 'deep_creative', subjectOrTask: 'Refactor auth module' });
    expect(brief.userFacingModeName).toBe('Project');
    expect(brief.sessionMode).toBe('CREATIVE');
  });
});

describe('Phase 17 — Active session: Clean minimal', () => {
  it('clean brief is minimal with no complexity', () => {
    const brief = buildLaneSessionBrief({ durationSeconds: 10 * 60, lane: 'minimal_normal' });
    expect(brief.sessionMode).toBe('LIGHT_FOCUS');
    expect(JSON.stringify(brief)).not.toMatch(/boss|challenge|quest|wager/i);
  });
});

describe('Phase 17 — Active session blocks second session', () => {
  it('blocks when hasActiveSession=true', () => {
    const rec = generateSessionRecommendation({
      userGoal: 'focus', timeOfDay: 9, streakUrgency: 'none', recoveryStatus: 'none',
      isFirstSession: false, hasActiveSession: true,
      userId: '00000000-0000-0000-0000-000000000001',
    });
    expect(rec.isBlocked).toBe(true);
  });
});

describe('Phase 17 — All lanes produce valid briefs', () => {
  it.each(ALL_LANES)('%s produces valid session brief', (lane) => {
    const brief = buildLaneSessionBrief({ durationSeconds: 15 * 60, lane });
    expect(brief.userFacingModeName).toBeTruthy();
    expect(brief.sessionMode).toBeTruthy();
    expect(brief.ctaLabel).toBeTruthy();
    expect(brief.title).toBeTruthy();
  });
  it.each(ALL_LANES)('%s lane brief has no economy refs', (lane) => {
    const json = JSON.stringify(buildLaneSessionBrief({ durationSeconds: 15 * 60, lane }));
    expect(json).not.toMatch(/shop|inventory|wallet|battle.pass|wager|social|ranking/i);
  });
});
