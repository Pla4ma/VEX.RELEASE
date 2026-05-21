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
});
