import { LaneMechanicPolicySchema } from './schemas';
import type { LaneMechanicPolicy, LaneProfile } from './types';

const POLICIES: Record<LaneProfile['primaryLane'], LaneMechanicPolicy> = {
  student: {
    lane: 'student',
    preferredMechanics: [
      'study_os',
      'deadline_risk',
      'review_queue',
      'recall_prompts',
      'study_streak',
      'tutor_coach',
    ],
    blockedMechanics: [
      'shop',
      'gems',
      'wagers',
      'broad_social',
      'blocker_full_cta',
    ],
  },
  game_like: {
    lane: 'game_like',
    preferredMechanics: [
      'focus_run',
      'personal_blocker',
      'focus_modifiers',
      'momentum_proofs',
      'companion_party_member',
      'optional_party_mode',
    ],
    blockedMechanics: [
      'gems',
      'shop',
      'trading',
      'wagers',
      'paid_saves',
      'generic_leaderboards',
    ],
  },
  deep_creative: {
    lane: 'deep_creative',
    preferredMechanics: [
      'project_thread',
      'next_move',
      'flow_window',
      'creative_warmup',
      'continuity_memory',
    ],
    blockedMechanics: [
      'loud_combat_default',
      'study_exam_copy',
      'economy',
      'generic_streak_panic',
    ],
  },
  minimal_normal: {
    lane: 'minimal_normal',
    preferredMechanics: [
      'today_strip',
      'clean_session',
      'quiet_progress',
      'short_coach',
      'low_notifications',
    ],
    blockedMechanics: [
      'blocker_full_cta',
      'challenge_spam',
      'xp_first_ui',
      'companion_chores',
      'economy',
    ],
  },
};

export function getLaneMechanicPolicy(
  profile: LaneProfile,
): LaneMechanicPolicy {
  return LaneMechanicPolicySchema.parse(POLICIES[profile.primaryLane]);
}
