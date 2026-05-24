import type { ActiveSessionDisplayPolicy } from "../utils/active-session-display-policy";

export interface BossCombatHUDProps {
  encounterId: string;
  userId: string;
  sessionProgress: number;
  purityScore: number;
  currentMode: string;
  isPaused: boolean;
  displayPolicy: ActiveSessionDisplayPolicy;
  userStreakDays?: number;
  bossHealth?: number;
  bossMaxHealth?: number;
  currentPhase?: "CALM" | "AGITATED" | "ENRAGED" | "DESPERATE";
  currentAttackPattern?: string | null;
}

export const ATTACK_NAMES: Record<string, string> = {
  DISTRACTION_WAVE: "Distraction Wave",
  PROCRASTINATION_BEAM: "Procrastination Beam",
  NOTIFICATION_BLAST: "Notification Blast",
  SOCIAL_MEDIA_TRAP: "Social Media Trap",
  MULTITASKING_TEMPEST: "Multitasking Tempest",
};
