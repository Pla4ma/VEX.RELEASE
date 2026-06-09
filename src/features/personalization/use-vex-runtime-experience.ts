import { useMemo } from 'react';
import { useOnboardingStore } from '../onboarding/store';
import { computeVexRuntimeExperience } from './vex-runtime-experience';
import type { VexRuntimeInput, VexRuntimeExperience } from './runtime-experience-types';

export function useVexRuntimeExperience(
  input: VexRuntimeInput,
): VexRuntimeExperience {
  const _duration = useOnboardingStore((s) => s.focusDuration);
  const goal = useOnboardingStore((s) => s.goal);
  const style = useOnboardingStore((s) => s.explicitMotivationStyle);

  const normalizedStyle =
    typeof style === 'string' &&
    [
      'calm',
      'friendly',
      'coach_led',
      'game_like',
      'intense',
      'study_focused',
    ].includes(style)
      ? (style as
          | 'calm'
          | 'friendly'
          | 'coach_led'
          | 'game_like'
          | 'intense'
          | 'study_focused')
      : undefined;

  const resolvedGoal: string | undefined = (() => {
    const g = goal;
    if (g === 'STUDY') {return 'study';}
    if (g === 'WORK') {return 'work';}
    if (g === 'CREATIVE') {return 'creative';}
    if (g === 'PERSONAL') {return 'personal';}
    return undefined;
  })();

  return useMemo(() => {
    const effectiveInput: VexRuntimeInput = {
      ...input,
      motivationStyle: input.motivationStyle ?? normalizedStyle,
      primaryGoal: input.primaryGoal ?? resolvedGoal,
    };
    return computeVexRuntimeExperience(effectiveInput);
  }, [input, normalizedStyle, resolvedGoal]);
}
