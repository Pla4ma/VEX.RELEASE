export type InterventionType =
  | 'BURNOUT'
  | 'PLATEAU'
  | 'STREAK_RISK'
  | 'BOSS_FINISH'
  | 'STUDY_BEHIND'
  | 'BOSS_OPPORTUNITY'
  | 'MOMENTUM_BUILDING'
  | 'COMEBACK_READY'
  | 'STUDY_PLAN_COMPLETE';

export interface Intervention {
  id: string;
  type: InterventionType;
  message: string;
  actionLabel: string;
  hoursRemaining?: number;
  metadata?: Record<string, unknown>;
}

export interface CoachInterventionBannerProps {
  intervention: Intervention | null;
  coachName: string;
  coachAvatar?: string;
  onAction?: (intervention: Intervention) => void;
  onDismiss?: (intervention: Intervention) => void;
}

export const DISMISSAL_STORAGE_KEY = 'dismissed_interventions';
export const DISMISSAL_TTL_HOURS = 24;
