import { useEffect } from 'react';
import { z } from 'zod';
import { trackInterventionDisplayed } from '../../../features/ai-coach/analytics';
import { eventBus } from '../../../events/EventBus';
import { getOrchestratorHandlesCompletion } from '../../../session/analytics/SessionAnalytics';
import type { HomeController } from '../hooks/home-controller-types';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks/useActiveIntervention';
import type { ToastOptions } from '../../../shared/ui/components/Toast';

const completionToastSummarySchema = z.object({
  grade: z.string().optional(),
  interruptions: z.number().int().nonnegative().optional(),
  focusQuality: z.number().optional(),
});


export interface InterventionBannerConfig {
  id: string;
  type: import('../../../features/ai-coach/components/CoachInterventionBanner').InterventionType;
  message: string;
  actionLabel: string;
  hoursRemaining: number;
  metadata: Record<string, unknown> | undefined;
}

export function useHomeScreenInnerEffects(params: {
  controller: HomeController;
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  showToast: (opts: ToastOptions) => string;
  displayedInterventionIdRef: React.MutableRefObject<string | null>;
  showIntervention: boolean;
  interventionType: string | undefined;
}): {
  interventionBannerProps: InterventionBannerConfig | null;
} {
  const {
    controller,
    intervention,
    showToast,
    displayedInterventionIdRef,
    showIntervention,
    interventionType,
  } = params;

  useEffect(() => {
    if (
      !controller.userId ||
      !intervention ||
      displayedInterventionIdRef.current === intervention.id
    )
      {return;}
    displayedInterventionIdRef.current = intervention.id;
    trackInterventionDisplayed(
      controller.userId,
      intervention.type,
      intervention.hoursRemaining,
    );
  }, [controller.userId, intervention, displayedInterventionIdRef]);

  useEffect(() => {
    if (getOrchestratorHandlesCompletion()) {return;}
    const unsubscribe = eventBus.subscribe(
      'session:completed',
      (evt: Record<string, unknown>) => {
        if (evt.userId !== controller.userId) {return;}
        const parsed = completionToastSummarySchema.safeParse(evt.summary);
        let toastTitle = 'Session complete.';
        let toastMessage = 'Result saved.';
        if (parsed.success) {
          const { grade, interruptions } = parsed.data;
          toastTitle = grade
            ? `${grade}-grade session.`
            : 'Session complete.';
          if ((interruptions ?? 0) > 0) {
            toastMessage = `${String(interruptions)} interruption${interruptions === 1 ? '' : 's'} kept this from cleaner work.`;
          }
        }
        showToast({
          type: 'success',
          title: toastTitle,
          message: toastMessage,
        });
      },
    );
    return unsubscribe;
  }, [controller.userId, showToast]);


  const interventionBannerProps: InterventionBannerConfig | null =
    showIntervention && intervention
      ? {
          id: intervention.id,
          type: (['BURNOUT', 'PLATEAU', 'STREAK_RISK', 'BOSS_FINISH'].includes(
            intervention.type,
          )
            ? intervention.type
            : 'STREAK_RISK') as InterventionBannerConfig['type'],
          message:
            interventionType === 'soft'
              ? `${intervention.message} (gentle reminder)`
              : intervention.message,
          actionLabel: intervention.actionLabel ?? 'Start session',
          hoursRemaining: intervention.hoursRemaining ?? 0,
          metadata: intervention.metadata as
            | Record<string, unknown>
            | undefined,
        }
      : null;

  return { interventionBannerProps };
}
