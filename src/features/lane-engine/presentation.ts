export { useInitialLane } from './hooks';
export { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Lane, LanePresentationPolicy } from './presentation-types';
import { LanePresentationPolicySchema } from './presentation-schemas';

type BaseLanePresentationPolicy = Omit<
  LanePresentationPolicy,
  'shouldRenderSkeleton'
>;

const POLICY_BY_LANE: Record<Lane, BaseLanePresentationPolicy> = {
  deep_creative: {
    animation: 'low_medium',
    copyTone: 'reflective_continuity',
    density: 'medium',
    emptyStateCta: 'Resume a project thread',
    errorStateHint: 'Keep the thread intact and retry.',
    icon: 'pen-tool',
    lane: 'deep_creative',
    loadingState: 'project_thread_skeleton',
    visualFeeling: 'studio_workbench',
  },
  game_like: {
    animation: 'medium_high',
    copyTone: 'strategic_energetic',
    density: 'medium_high',
    emptyStateCta: 'Start a clean encounter',
    errorStateHint: 'Keep the run safe and retry.',
    icon: 'shield',
    lane: 'game_like',
    loadingState: 'run_board_skeleton',
    visualFeeling: 'focused_roguelite_overlay',
  },
  minimal_normal: {
    animation: 'minimal',
    copyTone: 'concise_factual',
    density: 'low',
    emptyStateCta: 'Start one clean session',
    errorStateHint: 'Stay quiet; offer one retry.',
    icon: 'check-circle',
    lane: 'minimal_normal',
    loadingState: 'today_strip_skeleton',
    visualFeeling: 'quiet_planner',
  },
  student: {
    animation: 'low_medium',
    copyTone: 'precise_supportive',
    density: 'medium',
    emptyStateCta: 'Start a study block',
    errorStateHint: 'Keep the study plan visible and retry.',
    icon: 'book-open',
    lane: 'student',
    loadingState: 'study_plan_skeleton',
    visualFeeling: 'academic_command_center',
  },
};

export function getLanePresentationPolicy(input: {
  hiddenFeatureKeys?: string[];
  lane: Lane;
  reducedMotion: boolean;
}): LanePresentationPolicy {
  const base = POLICY_BY_LANE[input.lane];
  const animation = input.reducedMotion ? 'none' : base.animation;
  return LanePresentationPolicySchema.parse({
    ...base,
    animation,
    shouldRenderSkeleton: !input.hiddenFeatureKeys?.includes(base.loadingState),
  });
}
