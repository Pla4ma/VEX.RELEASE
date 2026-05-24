import type { SquadSummary } from './schemas';
import { launchColors } from '@theme/tokens/launch-colors';


export type WeeklySquadStats = {
  totalSessions: number;
  totalFocusMinutes: number;
  activeMemberCount: number;
};

const SHARE_COLORS = [launchColors.hex_7c3aed, launchColors.hex_2563eb, launchColors.hex_0ea5e9, launchColors.hex_10b981, launchColors.hex_f59e0b, launchColors.hex_ef4444];

export function buildSquadCode(squadId: string): string {
  return squadId.slice(0, 8);
}

export function getSquadAccentColor(name: string): string {
  const hash = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  return SHARE_COLORS[hash % SHARE_COLORS.length]!;
}

export function getEmptyWeeklyStats(): WeeklySquadStats {
  return { totalSessions: 0, totalFocusMinutes: 0, activeMemberCount: 0 };
}

export function toSquadSummary(squad: {
  id: string;
  name: string;
  avatarUrl: string | null;
  maxMembers: number;
  isPublic: boolean;
}): SquadSummary {
  return {
    id: squad.id,
    name: squad.name,
    avatarUrl: squad.avatarUrl,
    memberCount: 1,
    maxMembers: squad.maxMembers,
    focusMultiplier: 1,
    synergyLevel: 1,
    isPublic: squad.isPublic,
    isMember: true,
    userRole: 'FOUNDER',
  };
}

export function buildSquadShareMessage(
  squad: Pick<SquadSummary, 'name'>,
  weeklyStats: WeeklySquadStats,
  squadCode: string
): string {
  const focusHours = Math.round(weeklyStats.totalFocusMinutes / 60);
  return `My squad ${squad.name} just hit ${focusHours}h of focus this week on VEX. Join us: vex.app/squad/${squadCode}`;
}
