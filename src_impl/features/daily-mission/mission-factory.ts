/**
 * Mission Factory
 *
 * Creates daily missions based on mission type and additional data.
 */

import {
  DailyMissionSchema,
  type DailyMission,
  type MissionType,
} from './schemas';

/**
 * Creates a daily mission object based on the mission type
 */
export function createDailyMission(
  missionType: MissionType,
  userId: string,
  _additionalData?: Record<string, unknown>
): DailyMission {
  const now = Date.now();
  const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now

  const missionData = {
    id: `mission-${userId}-${missionType}-${now}`,
    type: missionType,
    priority: getMissionPriority(missionType),
    expiresAt,
    isCompleted: false,
    progress: 0,
    userId,
    ..._additionalData,
  };

  const mission = DailyMissionSchema.parse(missionData);
  return {
    ...mission,
    ...getMissionContent(missionType, _additionalData),
  };
}

/**
 * Gets the priority number for a mission type
 */
function getMissionPriority(missionType: MissionType): number {
  const priorityMap: Record<MissionType, number> = {
    'first-session': 1,
    'sync-repair': 2,
    'streak-critical': 3,
    'comeback-quest': 4,
    'daily-challenge': 5,
    'boss-fight': 6,
    'companion-care': 7,
    'coach-action': 8,
    'squad-goal': 9,
    'default-focus': 10,
  };
  return priorityMap[missionType];
}

/**
 * Gets the content (title, reason, CTA) for a mission type
 */
function getMissionContent(
  missionType: MissionType,
  _additionalData?: Record<string, unknown>
): Partial<DailyMission> {
  switch (missionType) {
    case 'first-session':
      return {
        title: 'Start your first focus session',
        reason: 'Your first session unlocks streaks, XP, and smarter recommendations.',
        ctaLabel: 'Start First Session',
        ctaRoute: 'SessionSetup',
        targetSystem: 'session',
        analyticsPayload: { missionType: 'first-session', source: 'daily-mission-engine' },
      };

    case 'sync-repair':
      return {
        title: 'Repair session sync',
        reason: 'Your recent session needs to be synced to protect your progress.',
        ctaLabel: 'Repair Sync',
        ctaRoute: 'SessionRepair',
        targetSystem: 'sync',
        analyticsPayload: { missionType: 'sync-repair', source: 'daily-mission-engine' },
      };

    case 'streak-critical':
      return {
        title: 'Save your streak',
        reason: 'You have less than 4 hours to complete a session and keep your streak alive.',
        ctaLabel: 'Save Streak',
        ctaRoute: 'SessionSetup',
        targetSystem: 'streak',
        analyticsPayload: { missionType: 'streak-critical', source: 'daily-mission-engine' },
      };

    case 'comeback-quest':
      return {
        title: 'Complete your comeback',
        reason: 'You need 3 focus sessions to restore your streak and momentum.',
        ctaLabel: 'Continue Comeback',
        ctaRoute: 'SessionSetup',
        targetSystem: 'comeback',
        analyticsPayload: { missionType: 'comeback-quest', source: 'daily-mission-engine' },
      };

    case 'daily-challenge':
      return {
        title: 'Complete today\'s challenge',
        reason: 'You have an active challenge that\'s ready to be completed.',
        ctaLabel: 'View Challenge',
        ctaRoute: 'Challenges',
        targetSystem: 'challenges',
        analyticsPayload: { missionType: 'daily-challenge', source: 'daily-mission-engine' },
      };

    case 'boss-fight':
      return {
        title: 'Defeat the boss',
        reason: 'The boss is nearly defeated! One more session could finish it.',
        ctaLabel: 'Fight Boss',
        ctaRoute: 'SessionSetup',
        targetSystem: 'boss',
        analyticsPayload: { missionType: 'boss-fight', source: 'daily-mission-engine' },
      };

    case 'companion-care':
      return {
        title: 'Care for your companion',
        reason: 'Your companion needs attention after recent sessions.',
        ctaLabel: 'Visit Companion',
        ctaRoute: 'CompanionDetail',
        targetSystem: 'companion',
        analyticsPayload: { missionType: 'companion-care', source: 'daily-mission-engine' },
      };

    case 'coach-action':
      return {
        title: 'Coach recommendation',
        reason: 'Your AI coach has a personalized recommendation for you.',
        ctaLabel: 'View Coach',
        ctaRoute: 'AICoach',
        targetSystem: 'coach',
        analyticsPayload: { missionType: 'coach-action', source: 'daily-mission-engine' },
      };

    case 'squad-goal':
      return {
        title: 'Support your squad',
        reason: 'Your squad needs your contribution to reach the weekly goal.',
        ctaLabel: 'View Squad',
        ctaRoute: 'SquadDetail',
        targetSystem: 'squad',
        analyticsPayload: { missionType: 'squad-goal', source: 'daily-mission-engine' },
      };

    case 'default-focus':
      return {
        title: 'Start a focus session',
        reason: 'A regular focus session keeps your momentum and builds your habits.',
        ctaLabel: 'Start Session',
        ctaRoute: 'SessionSetup',
        targetSystem: 'session',
        analyticsPayload: { missionType: 'default-focus', source: 'daily-mission-engine' },
      };

    default:
      const never: never = missionType;
      throw new Error(`Unknown mission type: ${never}`);
  }
}
