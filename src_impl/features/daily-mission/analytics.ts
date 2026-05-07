/**
 * Daily Mission Analytics
 *
 * Handles tracking and analytics for daily mission events.
 */

import Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import type { DailyMission, MissionType, MissionPriorityInput } from './types';

/**
 * Tracks when a daily mission is shown to the user
 */
export function trackMissionShown(mission: DailyMission): void {
  Sentry.addBreadcrumb({
    category: 'daily-mission',
    message: `Mission shown: ${mission.type}`,
    data: {
      missionId: mission.id,
      missionType: mission.type,
      priority: mission.priority,
      targetSystem: mission.targetSystem,
    },
    level: 'info',
  });

  eventBus.emit('daily-mission:shown', {
    missionId: mission.id,
    missionType: mission.type,
    priority: mission.priority,
    targetSystem: mission.targetSystem,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a user starts a daily mission
 */
export function trackMissionStarted(mission: DailyMission): void {
  Sentry.addBreadcrumb({
    category: 'daily-mission',
    message: `Mission started: ${mission.type}`,
    data: {
      missionId: mission.id,
      missionType: mission.type,
      targetSystem: mission.targetSystem,
    },
    level: 'info',
  });

  eventBus.emit('daily-mission:started', {
    missionId: mission.id,
    missionType: mission.type,
    targetSystem: mission.targetSystem,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a daily mission is completed
 */
export function trackMissionCompleted(mission: DailyMission): void {
  Sentry.addBreadcrumb({
    category: 'daily-mission',
    message: `Mission completed: ${mission.type}`,
    data: {
      missionId: mission.id,
      missionType: mission.type,
      priority: mission.priority,
      targetSystem: mission.targetSystem,
      finalProgress: mission.progress,
    },
    level: 'info',
  });

  eventBus.emit('daily-mission:completed', {
    missionId: mission.id,
    missionType: mission.type,
    priority: mission.priority,
    targetSystem: mission.targetSystem,
    finalProgress: mission.progress,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a daily mission is dismissed
 */
export function trackMissionDismissed(mission: DailyMission): void {
  Sentry.addBreadcrumb({
    category: 'daily-mission',
    message: `Mission dismissed: ${mission.type}`,
    data: {
      missionId: mission.id,
      missionType: mission.type,
      priority: mission.priority,
      currentProgress: mission.progress,
    },
    level: 'info',
  });

  eventBus.emit('daily-mission:dismissed', {
    missionId: mission.id,
    missionType: mission.type,
    priority: mission.priority,
    currentProgress: mission.progress,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a daily mission expires
 */
export function trackMissionExpired(mission: DailyMission): void {
  Sentry.addBreadcrumb({
    category: 'daily-mission',
    message: `Mission expired: ${mission.type}`,
    data: {
      missionId: mission.id,
      missionType: mission.type,
      priority: mission.priority,
      finalProgress: mission.progress,
    },
    level: 'warning',
  });

  eventBus.emit('daily-mission:expired', {
    missionId: mission.id,
    missionType: mission.type,
    priority: mission.priority,
    finalProgress: mission.progress,
    timestamp: Date.now(),
  });
}

/**
 * Tracks mission priority decisions for analytics
 */
export function trackMissionPriorityDecision(
  input: MissionPriorityInput,
  selectedMissionType: MissionType,
  rejectedTypes: MissionType[]
): void {
  Sentry.addBreadcrumb({
    category: 'daily-mission',
    message: `Mission priority decision: ${selectedMissionType}`,
    data: {
      selectedMissionType,
      rejectedTypes,
      inputState: {
        isFirstSession: input.isFirstSession,
        hasPendingSyncRepair: input.hasPendingSyncRepair,
        isStreakCritical: input.isStreakCritical,
        hasComebackQuest: input.hasComebackQuest,
        hasActiveDailyChallenge: input.hasActiveDailyChallenge,
        isBossNearDefeat: input.isBossNearDefeat,
        isBossEnabled: input.isBossEnabled,
        needsCompanionCare: input.needsCompanionCare,
        hasCoachAction: input.hasCoachAction,
        hasSquadWeeklyGoal: input.hasSquadWeeklyGoal,
        isSquadsEnabled: input.isSquadsEnabled,
      },
    },
    level: 'info',
  });

  eventBus.emit('daily-mission:priority-decision', {
    selectedMissionType,
    rejectedTypes,
    inputState: input,
    timestamp: Date.now(),
  });
}
