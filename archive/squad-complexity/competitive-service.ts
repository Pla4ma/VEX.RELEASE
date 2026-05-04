import { captureSilentFailure } from '../../utils/silent-failure';
import { z } from 'zod';

import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import {
  calculateContributionScore,
  type MemberContribution,
  type SquadMission,
} from './competitive-types';
import {
  fetchCompetitiveSquadMembers,
  fetchSessionsForMembers,
  upsertDailyContribution,
} from './competitive-repository';

const storage = getDefaultStorageAdapter();
const missionCacheSchema = z.object({
  refreshedOn: z.string(),
  missions: z.array(z.custom<SquadMission>()),
});
const dayActivitySchema = z.record(z.array(z.string()));

export type DailyContributionEntry = MemberContribution & { contributionScore: number };

function toDateKey(timestamp: string | null | undefined): string | null {
  if (!timestamp) {return null;}
  const value = new Date(timestamp);
  return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
}

function minutesFromSession(session: Awaited<ReturnType<typeof fetchSessionsForMembers>>[number]) {
  if (typeof session.focus_minutes === 'number') {return Math.max(0, session.focus_minutes);}
  if (typeof session.duration_minutes === 'number') {return Math.max(0, session.duration_minutes);}
  if (typeof session.total_focus_time === 'number') {return Math.max(0, Math.round(session.total_focus_time / 60));}
  return 0;
}

function missionKey(squadId: string) {
  return `competitive_squad_missions_${squadId}`;
}

function dayActivityKey(squadId: string) {
  return `competitive_squad_activity_${squadId}`;
}

function buildMissionSet(squadId: string, date: string): SquadMission[] {
  const weekNumber = Number(date.slice(8, 10));
  return [
    {
      id: `${squadId}-collective-hours-${date}`,
      weekNumber,
      title: '10-Hour Push',
      description: 'Bank 10 total squad focus hours today.',
      targetMinutes: 600,
      currentMinutes: 0,
      rewardPerMember: { type: 'COSMETIC', value: '+500 coins for all members' },
      status: 'ACTIVE',
      completedAt: null,
      memberProgress: {},
    },
    {
      id: `${squadId}-perfect-sessions-${date}`,
      weekNumber,
      title: 'Perfect Form',
      description: 'Stack 3 sessions above 90 purity together.',
      targetMinutes: 3,
      currentMinutes: 0,
      rewardPerMember: { type: 'XP_BOOST', value: '+500 coins for all members' },
      status: 'ACTIVE',
      completedAt: null,
      memberProgress: {},
    },
    {
      id: `${squadId}-consecutive-days-${date}`,
      weekNumber,
      title: 'All In For 3',
      description: 'Have every member active 3 days in a row.',
      targetMinutes: 3,
      currentMinutes: 0,
      rewardPerMember: { type: 'STREAK_SHIELD', value: '+500 coins for all members' },
      status: 'ACTIVE',
      completedAt: null,
      memberProgress: {},
    },
  ];
}

async function loadMissionCache(squadId: string, date: string): Promise<SquadMission[]> {
  try {
    const cached = missionCacheSchema.safeParse(await storage.getJSON<SquadMission[]>(missionKey(squadId)));
    if (cached.success && cached.data.refreshedOn === date) {return cached.data.missions;}
  } catch (error) { captureSilentFailure(error, { feature: 'squads', operation: 'network-fallback', type: 'network' });}
  const missions = buildMissionSet(squadId, date);
  await storage.setJSON(missionKey(squadId), { refreshedOn: date, missions });
  return missions;
}

async function saveMissionCache(squadId: string, date: string, missions: SquadMission[]) {
  await storage.setJSON(missionKey(squadId), { refreshedOn: date, missions });
}

export async function getDailyContributions(
  squadId: string,
  date: string,
): Promise<DailyContributionEntry[]> {
  const members = await fetchCompetitiveSquadMembers(squadId);
  const sessions = await fetchSessionsForMembers(members.map((member) => member.user_id));
  const summary = new Map<string, DailyContributionEntry>();
  sessions.forEach((session) => {
    const relevantDate =
      toDateKey(session.completed_at) ?? toDateKey(session.ended_at) ?? toDateKey(session.started_at);
    if (relevantDate !== date) {return;}
    const minutes = minutesFromSession(session);
    const purity = Math.max(0, Math.min(100, session.focus_purity_score ?? session.focus_quality ?? 0));
    const member = members.find((item) => item.user_id === session.user_id);
    const previous = summary.get(session.user_id);
    const username = member?.users?.first_name?.trim() || member?.users?.username?.trim() || 'Squadmate';
    const totalMinutes = (previous?.minutesFocused ?? 0) + minutes;
    const totalSessions = (previous?.sessionsCompleted ?? 0) + 1;
    const avgPurity = previous ? (previous.purityScore * previous.sessionsCompleted + purity) / totalSessions : purity;
    const score = calculateContributionScore(totalMinutes, avgPurity, avgPurity >= 90);
    summary.set(session.user_id, {
      userId: session.user_id,
      username,
      avatar: member?.users?.avatar_url ?? '',
      minutesFocused: totalMinutes,
      sessionsCompleted: totalSessions,
      purityScore: Math.round(avgPurity),
      isFocusingNow: false,
      currentSessionMinutes: 0,
      rank: 0,
      wasTopContributor: false,
      lastUpdated: Date.now(),
      contributionScore: score,
    });
  });
  return [...summary.values()]
    .sort((left, right) => right.contributionScore - left.contributionScore)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function getSquadMissions(squadId: string): Promise<SquadMission[]> {
  const date = new Date().toISOString().slice(0, 10);
  return loadMissionCache(squadId, date);
}

export async function updateUserContribution(
  userId: string,
  squadId: string,
  sessionData: { minutes: number; purityScore: number; streakMultiplier: number },
): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const contributionScore = calculateContributionScore(
    sessionData.minutes,
    sessionData.purityScore,
    sessionData.purityScore >= 90,
  );
  await upsertDailyContribution({
    userId,
    squadId,
    date,
    minutes: sessionData.minutes,
    purityScore: sessionData.purityScore,
    streakMultiplier: sessionData.streakMultiplier,
    contributionScore,
  });
  const missions = await loadMissionCache(squadId, date);
  const dayMap =
    dayActivitySchema.parse((await storage.getJSON<Record<string, string[]>>(dayActivityKey(squadId))) ?? {});
  const nextDays = Array.from(new Set([...(dayMap[userId] ?? []), date])).slice(-3);
  dayMap[userId] = nextDays;
  const updated = missions.map((mission) => {
    const memberProgress = { ...mission.memberProgress, [userId]: (mission.memberProgress[userId] ?? 0) + sessionData.minutes };
    const currentMinutes =
      mission.id.includes('collective-hours')
        ? Object.values(memberProgress).reduce((sum, value) => sum + value, 0)
        : mission.id.includes('perfect-sessions')
          ? Math.min(mission.targetMinutes, mission.currentMinutes + (sessionData.purityScore > 90 ? 1 : 0))
          : Math.min(mission.targetMinutes, Math.min(...Object.values(dayMap).map((days) => days.length), 3));
    const completed = currentMinutes >= mission.targetMinutes;
    const status: SquadMission['status'] = completed ? 'CLAIMED' : 'ACTIVE';
    return {
      ...mission,
      memberProgress,
      currentMinutes,
      status,
      completedAt: completed ? Date.now() : mission.completedAt,
    };
  });
  await storage.setJSON(dayActivityKey(squadId), dayMap);
  await saveMissionCache(squadId, date, updated);
}

