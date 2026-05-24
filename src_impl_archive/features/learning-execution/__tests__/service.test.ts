import {
  buildContentStudyGate,
  buildLearningExecutionCopy,
  buildLearningSessionParams,
  resolveLearningExecutionPersona,
} from '../service';

describe('learning execution service', () => {
  it('maps goals to adaptive layer names', () => {
    expect(resolveLearningExecutionPersona({ goal: 'STUDY' })).toBe('student');
    expect(resolveLearningExecutionPersona({ goal: 'WORK' })).toBe('work');
    expect(resolveLearningExecutionPersona({ goal: 'CREATIVE' })).toBe('creative');
    expect(resolveLearningExecutionPersona({ goal: 'PERSONAL' })).toBe('growth');
    expect(resolveLearningExecutionPersona({ goal: null, motivationPrimary: 'student' })).toBe('learning');
  });

  it('keeps school wording out of non-student execution copy', () => {
    const copy = buildLearningExecutionCopy({ persona: 'work' });
    const joined = [copy.layerName, copy.homeTitle, copy.homeCta, copy.emptyTitle, copy.emptyCta].join(' ');

    expect(joined).toContain('Deep Work Plan');
    expect(joined.toLowerCase()).not.toMatch(/study|quiz|homework/);
  });

  it('allows healthy student content upload early', () => {
    expect(
      buildContentStudyGate({
        aiConfigured: true,
        featureHealth: 'healthy',
        goal: 'STUDY',
        hasPrivacyDisclosure: true,
        rateLimitsConfigured: true,
        storageConfigured: true,
        totalCompletedSessions: 0,
      }),
    ).toEqual({ fallback: null, showUploadEntry: true });
  });

  it('does not show upload study wording to non-students on day zero', () => {
    const gate = buildContentStudyGate({
      aiConfigured: true,
      featureHealth: 'healthy',
      goal: 'WORK',
      hasPrivacyDisclosure: true,
      rateLimitsConfigured: true,
      storageConfigured: true,
      totalCompletedSessions: 0,
    });

    expect(gate.showUploadEntry).toBe(false);
    expect(gate.fallback).toBe('Attach a goal to your session');
  });

  it('uses a graceful fallback when content study is degraded', () => {
    const gate = buildContentStudyGate({
      aiConfigured: true,
      featureHealth: 'degraded',
      goal: 'STUDY',
      hasPrivacyDisclosure: true,
      rateLimitsConfigured: true,
      storageConfigured: true,
      totalCompletedSessions: 4,
    });

    expect(gate).toEqual({
      fallback: 'Start a normal focus session. VEX can retry content later.',
      showUploadEntry: false,
    });
  });

  it('builds session params tied to the shared execution layer', () => {
    const params = buildLearningSessionParams({
      contentId: 'content-1',
      focusAreas: ['chapter 2'],
      generationId: 'generation-1',
      nextTaskId: 'task-1',
      persona: 'creative',
      remainingMinutes: 45,
      title: 'Portfolio launch',
    });

    expect(params).toMatchObject({
      contentId: 'content-1',
      generationId: 'generation-1',
      learningExecutionLabel: 'Project Focus Path',
      learningExecutionTaskId: 'task-1',
      presetMode: 'CREATIVE',
      source: 'learning-execution',
      studyPlanId: 'generation-1',
      suggestedDurationSeconds: 2700,
    });
  });

  describe('adaptive naming: all five personae', () => {
    it('STUDY goal → student persona, Study OS label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'STUDY' })).toBe('student');
      const copy = buildLearningExecutionCopy({ persona: 'student' });
      expect(copy.layerName).toBe('Study OS');
      expect(copy.homeTitle).toBe('Study OS');
    });

    it('LEARNING goal → learning persona, Learning OS label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'LEARNING' })).toBe('learning');
      const copy = buildLearningExecutionCopy({ persona: 'learning' });
      expect(copy.layerName).toBe('Learning OS');
      expect(copy.homeTitle).toBe('Learning OS');
    });

    it('WORK goal → work persona, Deep Work Plan label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'WORK' })).toBe('work');
      const copy = buildLearningExecutionCopy({ persona: 'work' });
      expect(copy.layerName).toBe('Deep Work Plan');
      expect(copy.homeTitle).toBe('Deep Work Plan');
    });

    it('CREATIVE goal → creative persona, Project Focus Path label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'CREATIVE' })).toBe('creative');
      const copy = buildLearningExecutionCopy({ persona: 'creative' });
      expect(copy.layerName).toBe('Project Focus Path');
      expect(copy.homeTitle).toBe('Project Focus Path');
    });

    it('PERSONAL goal → growth persona, Growth Path label', () => {
      expect(resolveLearningExecutionPersona({ goal: 'PERSONAL' })).toBe('growth');
      const copy = buildLearningExecutionCopy({ persona: 'growth' });
      expect(copy.layerName).toBe('Growth Path');
      expect(copy.homeTitle).toBe('Growth Path');
    });
  });

  describe('school-only copy does not leak to non-study users', () => {
    it('study user copy allows school wording', () => {
      const copy = buildLearningExecutionCopy({ persona: 'student' });
      expect(copy.layerName).toBe('Study OS');
    });

    it('work user copy has no quiz/homework/chapter references', () => {
      const copy = buildLearningExecutionCopy({ persona: 'work' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta, copy.emptyTitle, copy.emptyCta, copy.setupCta, copy.setupEyebrow].join(' ');
      expect(joined.toLowerCase()).not.toMatch(/quiz|homework|chapter/);
    });

    it('creative user copy has no school wording', () => {
      const copy = buildLearningExecutionCopy({ persona: 'creative' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta].join(' ');
      expect(joined.toLowerCase()).not.toMatch(/quiz|homework|chapter|study\s+os/i);
    });

    it('growth user copy has no school wording', () => {
      const copy = buildLearningExecutionCopy({ persona: 'growth' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta].join(' ');
      expect(joined.toLowerCase()).not.toMatch(/quiz|homework|chapter|study\s+os/i);
    });

    it('learning user copy has no quiz/homework/chapter', () => {
      const copy = buildLearningExecutionCopy({ persona: 'learning' });
      const joined = [copy.layerName, copy.homeTitle, copy.homeCta].join(' ');
      expect(joined.toLowerCase()).not.toMatch(/quiz|homework|chapter/);
    });
  });

  describe('LEARNING goal content study gate', () => {
    it('allows content upload for LEARNING users', () => {
      const gate = buildContentStudyGate({
        aiConfigured: true,
        featureHealth: 'healthy',
        goal: 'LEARNING',
        hasPrivacyDisclosure: true,
        rateLimitsConfigured: true,
        storageConfigured: true,
        totalCompletedSessions: 0,
      });

      expect(gate.showUploadEntry).toBe(true);
      expect(gate.fallback).toBeNull();
    });
  });
});
