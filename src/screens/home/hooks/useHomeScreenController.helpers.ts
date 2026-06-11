import type { SessionRecommendation } from '../../../features/ai-coach';
import type { ActiveStudyPlan } from '../../../features/content-study';

export function pickPrimaryRecommendation(
  data: SessionRecommendation[] | undefined,
): SessionRecommendation | null {
  return (
    (data ?? [])
      .filter(
        (item) => item.status === 'ACTIVE' && item.expiresAt > Date.now(),
      )
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null
  );
}

export function mapActiveStudyPlanInput(
  data: ActiveStudyPlan | null | undefined,
): { contentId: string; generationId: string } | null {
  return data
    ? { contentId: data.contentId, generationId: data.generationId }
    : null;
}
