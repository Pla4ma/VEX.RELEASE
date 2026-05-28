import type { BaseModel } from "./user";

export interface Achievement extends BaseModel {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  criteria: AchievementCriteria;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export type AchievementCategory =
  | "social"
  | "gaming"
  | "economy"
  | "exploration"
  | "mastery"
  | "special";

export type AchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface AchievementCriteria {
  type: string;
  target: number;
  conditions?: Record<string, unknown>;
}

export interface Squad extends BaseModel {
  name: string;
  description?: string;
  avatar?: string;
  banner?: string;
  ownerId: string;
  members: SquadMember[];
  settings: SquadSettings;
  stats: SquadStats;
}

export interface SquadMember {
  userId: string;
  role: SquadMemberRole;
  joinedAt: string;
  contributions: number;
}

export type SquadMemberRole = "member" | "officer" | "coLeader" | "leader";

export interface SquadSettings {
  visibility: "public" | "private" | "inviteOnly";
  requiresApproval: boolean;
  maxMembers: number;
  allowInvites: boolean;
  allowChat: boolean;
}

export interface SquadStats {
  totalMembers: number;
  totalAchievements: number;
  totalPoints: number;
  rank?: number;
  winRate: number;
}
