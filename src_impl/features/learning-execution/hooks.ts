import { useMemo } from 'react';
import { useOnboardingStore } from '../onboarding/store';
import type { ActiveStudyPlan } from '../content-study';
import { mapActivePlanToLearningTarget } from './repository';
import {
  buildLearningExecutionLayer,
  resolveLearningExecutionPersona,
} from './service';
import type { LearningExecutionLayer } from './types';

export function useLearningExecutionLayer(
  activePlan: ActiveStudyPlan | null,
): LearningExecutionLayer {
  const goal = useOnboardingStore((state) => state.goal);
  const motivationPrimary = useOnboardingStore(
    (state) => state.motivationProfile?.primary,
  );

  return useMemo(() => {
    const persona = resolveLearningExecutionPersona({ goal, motivationPrimary });
    const target = mapActivePlanToLearningTarget({ persona, plan: activePlan });
    return buildLearningExecutionLayer({ persona, target });
  }, [activePlan, goal, motivationPrimary]);
}
