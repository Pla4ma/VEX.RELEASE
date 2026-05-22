import { z } from 'zod';

export const ContentStudyVisibilitySchema = z.object({
  canShowTeaser: z.boolean(),
  canShowUploadEntry: z.boolean(),
  canNavigateToUpload: z.boolean(),
  canRunBackend: z.boolean(),
  fallbackLabel: z.string().nullable(),
  restrictionReason: z.string().nullable(),
}).strict();

export type ContentStudyVisibility = z.infer<typeof ContentStudyVisibilitySchema>;

interface ContentStudyVisibilityInput {
  motivationStyle: string | null;
  primaryGoal: string | null;
  totalCompletedSessions: number;
  studyUsageRatio: number;
  featureHealth: 'healthy' | 'degraded' | 'unavailable';
  aiConfigured: boolean;
  hasPrivacyDisclosure: boolean;
  rateLimitsConfigured: boolean;
  storageConfigured: boolean;
  canRenderEntryPoint: boolean;
  canNavigate: boolean;
  canQuery: boolean;
  canUseBackend: boolean;
}

export function buildContentStudyVisibility(input: ContentStudyVisibilityInput): ContentStudyVisibility {
  const isStudyFocused = input.motivationStyle === 'study_focused' || input.motivationStyle === 'student';
  const isStudyGoal = input.primaryGoal === 'STUDY' || input.primaryGoal === 'study';
  const isLearningGoal = input.primaryGoal === 'LEARNING' || input.primaryGoal === 'learning';
  const isHighStudyIntent = isStudyFocused || isStudyGoal || isLearningGoal || input.studyUsageRatio >= 0.35;
  const isDayZero = input.totalCompletedSessions === 0;
  const isConfigured = input.aiConfigured && input.storageConfigured && input.rateLimitsConfigured && input.hasPrivacyDisclosure;
  const isHealthy = input.featureHealth === 'healthy' && isConfigured;

  if (!input.canRenderEntryPoint) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: false,
      canShowUploadEntry: false,
      canNavigateToUpload: false,
      canRunBackend: false,
      fallbackLabel: null,
      restrictionReason: 'content_study entry point is gated by feature availability',
    });
  }

  if (input.featureHealth === 'degraded' || !isConfigured) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: false,
      canShowUploadEntry: false,
      canNavigateToUpload: false,
      canRunBackend: false,
      fallbackLabel: 'VEX is working to restore content features. Start a normal session in the meantime.',
      restrictionReason: 'Content study backend is degraded or misconfigured',
    });
  }

  if (input.featureHealth === 'unavailable') {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: false,
      canShowUploadEntry: false,
      canNavigateToUpload: false,
      canRunBackend: false,
      fallbackLabel: 'Content features are temporarily unavailable.',
      restrictionReason: 'Content study is marked unavailable',
    });
  }

  const canRunBackend = isHealthy && input.canQuery && input.canUseBackend;
  const canNavigateToUpload = isHealthy && input.canNavigate;

  if (isDayZero && isHighStudyIntent) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: true,
      canShowUploadEntry: true,
      canNavigateToUpload,
      canRunBackend,
      fallbackLabel: null,
      restrictionReason: null,
    });
  }

  if (isDayZero && !isHighStudyIntent) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: false,
      canShowUploadEntry: false,
      canNavigateToUpload: false,
      canRunBackend: false,
      fallbackLabel: 'Attach a target to your session',
      restrictionReason: 'Content study requires study intent on Day 0',
    });
  }

  if (isHighStudyIntent) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: true,
      canShowUploadEntry: true,
      canNavigateToUpload,
      canRunBackend,
      fallbackLabel: null,
      restrictionReason: null,
    });
  }

  return ContentStudyVisibilitySchema.parse({
    canShowTeaser: true,
    canShowUploadEntry: isHealthy,
    canNavigateToUpload,
    canRunBackend,
    fallbackLabel: isHealthy ? 'Build a deep work path' : 'Start a normal focus session. Content tools will return.',
    restrictionReason: isHealthy ? null : 'Backend unavailable for non-study users',
  });
}
