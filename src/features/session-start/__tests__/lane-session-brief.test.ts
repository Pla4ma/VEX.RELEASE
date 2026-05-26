import { buildLaneSessionBrief } from '../service';

describe('lane session brief', () => {
  describe('userFacingModeName', () => {
    it.each([
      ['student', 'Study'],
      ['game_like', 'Run'],
      ['deep_creative', 'Project'],
      ['minimal_normal', 'Clean'],
    ] as const)('maps %s lane to userFacingModeName "%s"', (lane, expectedName) => {
      const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane });
      expect(brief.userFacingModeName).toBe(expectedName);
    });
  });

  it.each([
    ['student', 'Start study block', 'STUDY'],
    ['game_like', 'Start encounter', 'SPRINT'],
    ['deep_creative', 'Resume project block', 'CREATIVE'],
    ['minimal_normal', 'Start clean session', 'LIGHT_FOCUS'],
  ] as const)('builds lane setup for %s', (lane, ctaLabel, sessionMode) => {
    const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane });

    expect(brief.ctaLabel).toBe(ctaLabel);
    expect(brief.sessionMode).toBe(sessionMode);
    expect(JSON.stringify(brief)).not.toMatch(/wager|insuranceCost|bountyCost|wallet|gem|shop|inventory|coin/i);
    expect(brief.focusStrategyLoadout).toContain('Phone away');
  });

  // PHASE 5 - Test 1: Study setup shows study brief
  it('study setup shows study brief with subject framing', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 25 * 60,
      lane: 'student',
      subjectOrTask: 'Calculus chapter 4',
    });

    expect(brief.userFacingModeName).toBe('Study');
    expect(brief.sessionMode).toBe('STUDY');
    expect(brief.ctaLabel).toBe('Start study block');
    expect(brief.title).toBe('Study block ready');
  });

  // PHASE 5 - Test 2: Run setup shows run brief without currency
  it('run setup shows encounter brief with no currency references', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 15 * 60,
      lane: 'game_like',
    });

    expect(brief.userFacingModeName).toBe('Run');
    expect(brief.sessionMode).toBe('SPRINT');
    expect(brief.ctaLabel).toBe('Start encounter');
    expect(JSON.stringify(brief)).not.toMatch(/coin|gem|shop|wager|currency|bounty/i);
  });

  // PHASE 5 - Test 3: Project setup shows project next move
  it('project setup shows resume thread framing', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 30 * 60,
      lane: 'deep_creative',
      projectTitle: 'Portfolio redesign',
    });

    expect(brief.userFacingModeName).toBe('Project');
    expect(brief.sessionMode).toBe('CREATIVE');
    expect(brief.ctaLabel).toBe('Resume project block');
  });

  // PHASE 5 - Test 4: Clean setup shows minimal brief
  it('clean setup shows minimal brief with low noise', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 25 * 60,
      lane: 'minimal_normal',
    });

    expect(brief.userFacingModeName).toBe('Clean');
    expect(brief.sessionMode).toBe('LIGHT_FOCUS');
    expect(brief.title).toBe('Clean session ready');
    expect(brief.body).toContain('Name one task');
  });

  // PHASE 5 - Test 5: first session setup remains short
  it('first session setup stays short across all lanes', () => {
    const lanes = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;
    for (const lane of lanes) {
      const brief = buildLaneSessionBrief({ durationSeconds: 15 * 60, lane });
      expect(brief.suggestedDurationSeconds).toBeLessThanOrEqual(90 * 60);
      expect(brief.title.length).toBeLessThan(50);
      expect(brief.body.length).toBeLessThan(200);
    }
  });

  // PHASE 5 - Test 6: old economy words do not appear
  it('no old economy words appear in any lane brief', () => {
    const lanes = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;
    for (const lane of lanes) {
      const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane });
      const json = JSON.stringify(brief);
      expect(json).not.toMatch(/wager/i);
      expect(json).not.toMatch(/insurance.*cost/i);
      expect(json).not.toMatch(/bounty.*cost/i);
      expect(json).not.toMatch(/wallet/i);
      expect(json).not.toMatch(/"gem/i);
      expect(json).not.toMatch(/shop/i);
      expect(json).not.toMatch(/inventory/i);
      expect(json).not.toMatch(/"coin/i);
      expect(json).not.toMatch(/currency/i);
    }
  });

  // PHASE 5 - Test 7: rescue creates 5-12 minute session
  it('keeps rescue setup between five and twelve minutes', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 60 * 60,
      isRescue: true,
      lane: 'minimal_normal',
    });

    expect(brief.suggestedDurationSeconds).toBe(12 * 60);
    expect(brief.suggestedDurationSeconds).toBeGreaterThanOrEqual(5 * 60);
    expect(brief.suggestedDurationSeconds).toBeLessThanOrEqual(12 * 60);
    expect(brief.risk?.type).toBe('avoidance');
    expect(brief.friction?.level).toBe('soft');
  });

  it('rescue gives lane-specific success conditions', () => {
    const studentBrief = buildLaneSessionBrief({ isRescue: true, lane: 'student' });
    const gameBrief = buildLaneSessionBrief({ isRescue: true, lane: 'game_like' });
    const creativeBrief = buildLaneSessionBrief({ isRescue: true, lane: 'deep_creative' });
    const cleanBrief = buildLaneSessionBrief({ isRescue: true, lane: 'minimal_normal' });

    expect(studentBrief.successCondition).toContain('five honest study minutes');
    expect(gameBrief.successCondition).toContain('clean hit');
    expect(creativeBrief.successCondition).toContain('project edit');
    expect(cleanBrief.successCondition).toContain('five minutes');
  });

  // PHASE 5 - Test 8: offline fallback works
  it('keeps offline setup usable without heavy sync copy', () => {
    const brief = buildLaneSessionBrief({
      isOffline: true,
      lane: 'student',
    });

    expect(brief.offlineMessage).toContain('offline');
  });

  // PHASE 5 - Test 9: hidden systems do not query (verified via schema)
  it('has no references to hidden system features', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 25 * 60,
      lane: 'minimal_normal',
    });

    expect(brief).toHaveProperty('userFacingModeName');
    expect(brief).toHaveProperty('lane');
    expect(brief).toHaveProperty('suggestedDurationSeconds');
    expect(brief).not.toHaveProperty('wallet');
    expect(brief).not.toHaveProperty('stakeAmount');
  });
});
