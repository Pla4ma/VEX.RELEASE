import {
  ContentStudyGateInputSchema,
  ContentStudyGateSchema,
  LearningExecutionCopySchema,
  LearningExecutionLayerSchema,
  LearningSessionTargetSchema,
} from './schemas';
import type {
  LearningExecutionCopy,
  LearningExecutionLayer,
  LearningExecutionPersona,
  LearningSessionTarget,
} from './types';

type Goal = 'WORK' | 'STUDY' | 'CREATIVE' | 'PERSONAL' | 'LEARNING' | null;
type Motivation = 'student' | 'creator' | 'worker' | string | null | undefined;

const copyMap: Record<LearningExecutionPersona, LearningExecutionCopy> = {
  creative: LearningExecutionCopySchema.parse({
    completionTitle: 'Project focus moved forward',
    emptyCta: 'Build a project path',
    emptyTitle: 'Shape the next project block',
    errorCta: 'Retry project path',
    errorTitle: 'Could not load project path',
    homeCta: 'Start focus path',
    homeTitle: 'Project Focus Path',
    layerName: 'Project Focus Path',
    setupCta: 'Start project block',
    setupEyebrow: 'Project Focus',
  }),
  growth: LearningExecutionCopySchema.parse({
    completionTitle: 'Growth path advanced',
    emptyCta: 'Build a growth path',
    emptyTitle: 'Pick the next growth block',
    errorCta: 'Retry growth path',
    errorTitle: 'Could not load growth path',
    homeCta: 'Start growth block',
    homeTitle: 'Growth Path',
    layerName: 'Growth Path',
    setupCta: 'Start growth block',
    setupEyebrow: 'Growth Path',
  }),
  learning: LearningExecutionCopySchema.parse({
    completionTitle: 'Learning loop advanced',
    emptyCta: 'Build a learning path',
    emptyTitle: 'Choose the next learning block',
    errorCta: 'Retry learning path',
    errorTitle: 'Could not load learning path',
    homeCta: 'Start learning block',
    homeTitle: 'Learning OS',
    layerName: 'Learning OS',
    setupCta: 'Start learning block',
    setupEyebrow: 'Learning OS',
  }),
  student: LearningExecutionCopySchema.parse({
    completionTitle: 'Study progress updated',
    emptyCta: 'Start study session',
    emptyTitle: 'Set a study target and start a focused block',
    errorCta: 'Retry study path',
    errorTitle: 'Could not load study path',
    homeCta: 'Continue study',
    homeTitle: 'Study',
    layerName: 'Study',
    setupCta: 'Start study session',
    setupEyebrow: 'Study',
  }),
  work: LearningExecutionCopySchema.parse({
    completionTitle: 'Deep work plan advanced',
    emptyCta: 'Build a deep work path',
    emptyTitle: 'Attach the next work target',
    errorCta: 'Retry deep work plan',
    errorTitle: 'Could not load deep work plan',
    homeCta: 'Start deep work',
    homeTitle: 'Deep Work Plan',
    layerName: 'Deep Work Plan',
    setupCta: 'Start deep work block',
    setupEyebrow: 'Deep Work Plan',
  }),
};

export function resolveLearningExecutionPersona(input: {
  goal: Goal;
  motivationPrimary?: Motivation;
}): LearningExecutionPersona {
  if (input.goal === 'STUDY') {
    return 'student';
  }
  if (input.goal === 'LEARNING') {
    return 'learning';
  }
  if (input.goal === 'WORK') {
    return 'work';
  }
  if (input.goal === 'CREATIVE') {
    return 'creative';
  }
  if (input.goal === 'PERSONAL') {
    return 'growth';
  }
  if (input.motivationPrimary === 'student') {
    return 'learning';
  }
  if (input.motivationPrimary === 'creator') {
    return 'creative';
  }
  if (input.motivationPrimary === 'worker') {
    return 'work';
  }
  return 'work';
}

export function buildLearningExecutionCopy(input: {
  persona: LearningExecutionPersona;
}): LearningExecutionCopy {
  return LearningExecutionCopySchema.parse(copyMap[input.persona]);
}

export function buildContentStudyGate(input: unknown) {
  const parsed = ContentStudyGateInputSchema.parse(input);
  const configured =
    parsed.aiConfigured &&
    parsed.storageConfigured &&
    parsed.rateLimitsConfigured &&
    parsed.hasPrivacyDisclosure;
  const isStudyGoal = parsed.goal === 'STUDY' || parsed.goal === 'LEARNING';

  if (parsed.featureHealth !== 'healthy' || !configured) {
    return ContentStudyGateSchema.parse({
      fallback: 'Start a normal focus session. VEX can retry content later.',
      showUploadEntry: false,
    });
  }

  if (parsed.totalCompletedSessions < 3) {
    return ContentStudyGateSchema.parse({
      fallback: isStudyGoal
        ? 'Start with a study target and one focused block.'
        : 'Attach a goal to your session',
      showUploadEntry: false,
    });
  }

  return ContentStudyGateSchema.parse({
    fallback: isStudyGoal ? null : 'Build a deep work path',
    showUploadEntry: isStudyGoal,
  });
}

export function buildLearningSessionParams(target: LearningSessionTarget) {
  const parsed = LearningSessionTargetSchema.parse(target);
  const copy = buildLearningExecutionCopy({ persona: parsed.persona });
  const presetMode: 'CREATIVE' | 'STUDY' | 'DEEP_WORK' =
    parsed.persona === 'creative'
      ? 'CREATIVE'
      : parsed.persona === 'student' || parsed.persona === 'learning'
        ? 'STUDY'
        : 'DEEP_WORK';

  return {
    contentId: parsed.contentId,
    focusAreas: parsed.focusAreas,
    generationId: parsed.generationId,
    learningExecutionLabel: copy.layerName,
    learningExecutionTaskId: parsed.nextTaskId ?? undefined,
    goal: parsed.title,
    presetMode,
    source: 'learning-execution' as const,
    studyPlanId: parsed.generationId,
    suggestedDurationSeconds: parsed.remainingMinutes * 60,
  };
}

export function buildLearningExecutionLayer(input: {
  persona: LearningExecutionPersona;
  target: LearningSessionTarget | null;
}): LearningExecutionLayer {
  return LearningExecutionLayerSchema.parse({
    copy: buildLearningExecutionCopy({ persona: input.persona }),
    dataModelImpact:
      'LearningExecutionLayer reuses content, generation, task, and session ids; only route metadata and adaptive copy are added.',
    persona: input.persona,
    target: input.target,
  });
}
