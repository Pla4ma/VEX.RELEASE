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

function canUseContentStudyBackend(input: ContentStudyVisibilityInput): boolean {
  return input.featureHealth === 'healthy' &&
    input.aiConfigured &&
    input.storageConfigured &&
    input.rateLimitsConfigured &&
    input.hasPrivacyDisclosure &&
    input.canNavigate &&
    input.canQuery &&
    input.canUseBackend;
}

export function buildContentStudyVisibility(input: ContentStudyVisibilityInput): ContentStudyVisibility {
  const isStudyFocused = input.motivationStyle === 'study_focused' || input.motivationStyle === 'student';
  const isStudyGoal = input.primaryGoal === 'STUDY' || input.primaryGoal === 'study';
  const isLearningGoal = input.primaryGoal === 'LEARNING' || input.primaryGoal === 'learning';
  const isHighStudyIntent = isStudyFocused || isStudyGoal || isLearningGoal || input.studyUsageRatio >= 0.35;
  const isDayZero = input.totalCompletedSessions === 0;
  const canRunBackend = canUseContentStudyBackend(input);
  const hasStudyPath = input.totalCompletedSessions >= 3 || input.studyUsageRatio >= 0.35;
  const canShowUpload = canRunBackend && isHighStudyIntent && hasStudyPath;

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

  if (input.featureHealth === 'degraded' || !canRunBackend) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: isHighStudyIntent,
      canShowUploadEntry: false,
      canNavigateToUpload: false,
      canRunBackend: false,
      fallbackLabel: 'Start a study session. VEX can restore content tools when the backend is ready.',
      restrictionReason: 'Content study backend is degraded or misconfigured',
    });
  }

  if (isDayZero && isHighStudyIntent) {
    return ContentStudyVisibilitySchema.parse({
      canShowTeaser: true,
      canShowUploadEntry: false,
      canNavigateToUpload: false,
      canRunBackend,
      fallbackLabel: 'Start with a study target and one focused block.',
      restrictionReason: 'Content upload unlocks after study intent is proven',
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
      canShowUploadEntry: canShowUpload,
      canNavigateToUpload: canShowUpload,
      canRunBackend,
      fallbackLabel: canShowUpload ? null : 'Keep using study sessions. Content tools unlock after a few focused blocks.',
      restrictionReason: canShowUpload ? null : 'Study Path not ready for Content Study upload',
    });
  }

  return ContentStudyVisibilitySchema.parse({
    canShowTeaser: false,
    canShowUploadEntry: false,
    canNavigateToUpload: false,
    canRunBackend,
    fallbackLabel: 'Build a deep work path',
    restrictionReason: 'Content Study is hidden for non-study users',
  });
}
