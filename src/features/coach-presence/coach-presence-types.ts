import type { FeatureAvailability } from '../liveops-config';
import type { CompanionState } from '../companion/types';
import type { LaneProfile } from '../lane-engine/types';
import type {
  CoachPresenceMemorySummary,
  CoachPresenceMotivationStyle,
  CoachPresenceProgressInput,
  CompletionPresenceSummary,
} from './schemas';

export interface PresenceAvailability {
  focus: FeatureAvailability;
  progress: FeatureAvailability;
  study: FeatureAvailability;
}

export interface BuildPresenceInput {
  companion: Pick<CompanionState, 'currentMood' | 'element' | 'level' | 'phase'> | null;
  featureAvailability: PresenceAvailability;
  laneProfile?: LaneProfile | null;
  memorySummary: CoachPresenceMemorySummary;
  motivationStyle: CoachPresenceMotivationStyle;
  progress: CoachPresenceProgressInput;
  surface: 'HOME' | 'SESSION_SETUP' | 'CHAT' | 'RESCUE' | 'PREMIUM';
}

export interface CompletionPresenceInput {
  featureAvailability: PresenceAvailability;
  laneProfile?: LaneProfile | null;
  memorySummary: CoachPresenceMemorySummary;
  motivationStyle: CoachPresenceMotivationStyle;
  summary: CompletionPresenceSummary;
}
