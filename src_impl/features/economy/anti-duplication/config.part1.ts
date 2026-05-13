import type { DeduplicationRule, ExploitPattern, AntiDuplicationConfig } from "./schemas";


export const DEFAULT_DEDUPLICATION_RULES: DeduplicationRule[] = [
  {
    id: 'session-complete-dedup',
    name: 'Session Completion Deduplication',
    description: 'Prevents duplicate session completion rewards',
    actionType: 'SESSION_COMPLETE',
    keyTemplate: 'session_{userId}_{sessionId}',
    keyVariables: ['userId', 'sessionId'],
    timeWindow: 0, // Forever - each session can only be completed once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'This session has already been completed',
    },
    isActive: true,
    priority: 1,
  },

  {
    id: 'daily-login-dedup',
    name: 'Daily Login Deduplication',
    description: 'Prevents duplicate daily login rewards',
    actionType: 'DAILY_LOGIN',
    keyTemplate: 'daily_login_{userId}_{date}',
    keyVariables: ['userId', 'date'],
    timeWindow: 86400, // 24 hours
    resetSchedule: 'DAILY',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: true,
      logAttempt: true,
      customMessage: 'Daily login reward already claimed today',
    },
    isActive: true,
    priority: 2,
  },

  {
    id: 'streak-milestone-dedup',
    name: 'Streak Milestone Deduplication',
    description: 'Prevents duplicate streak milestone rewards',
    actionType: 'STREAK_MILESTONE',
    keyTemplate: 'streak_milestone_{userId}_{milestone}',
    keyVariables: ['userId', 'milestone'],
    timeWindow: 0, // Forever - each milestone can only be earned once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'This streak milestone has already been achieved',
    },
    isActive: true,
    priority: 3,
  },

  {
    id: 'achievement-unlock-dedup',
    name: 'Achievement Unlock Deduplication',
    description: 'Prevents duplicate achievement unlock rewards',
    actionType: 'ACHIEVEMENT_UNLOCK',
    keyTemplate: 'achievement_{userId}_{achievementId}',
    keyVariables: ['userId', 'achievementId'],
    timeWindow: 0, // Forever - each achievement can only be unlocked once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'This achievement has already been unlocked',
    },
    isActive: true,
    priority: 4,
  },

  {
    id: 'boss-defeat-dedup',
    name: 'Boss Defeat Deduplication',
    description: 'Prevents duplicate boss defeat rewards',
    actionType: 'BOSS_DEFEAT',
    keyTemplate: 'boss_defeat_{userId}_{bossId}_{date}',
    keyVariables: ['userId', 'bossId', 'date'],
    timeWindow: 86400, // 24 hours - can defeat same boss once per day
    resetSchedule: 'DAILY',
    conditions: {
      minLevel: 5,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: true,
      logAttempt: true,
      customMessage: 'This boss has already been defeated today. Come back tomorrow!',
    },
    isActive: true,
    priority: 5,
  },

  {
    id: 'level-up-dedup',
    name: 'Level Up Deduplication',
    description: 'Prevents duplicate level up rewards',
    actionType: 'LEVEL_UP',
    keyTemplate: 'level_up_{userId}_{level}',
    keyVariables: ['userId', 'level'],
    timeWindow: 0, // Forever - each level can only be reached once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'This level has already been achieved',
    },
    isActive: true,
    priority: 6,
  },

  {
    id: 'quest-complete-dedup',
    name: 'Quest Completion Deduplication',
    description: 'Prevents duplicate quest completion rewards',
    actionType: 'QUEST_COMPLETE',
    keyTemplate: 'quest_{userId}_{questId}',
    keyVariables: ['userId', 'questId'],
    timeWindow: 0, // Forever - each quest can only be completed once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'This quest has already been completed',
    },
    isActive: true,
    priority: 7,
  },

  {
    id: 'challenge-complete-dedup',
    name: 'Challenge Completion Deduplication',
    description: 'Prevents duplicate daily challenge completion rewards',
    actionType: 'CHALLENGE_COMPLETE',
    keyTemplate: 'challenge_{userId}_{challengeId}_{date}',
    keyVariables: ['userId', 'challengeId', 'date'],
    timeWindow: 86400, // 24 hours - daily challenges reset daily
    resetSchedule: 'DAILY',
    conditions: {
      minLevel: 3,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: true,
      logAttempt: true,
      customMessage: 'This challenge has already been completed today',
    },
    isActive: true,
    priority: 8,
  },

  {
    id: 'squad-join-dedup',
    name: 'Squad Join Deduplication',
    description: 'Prevents duplicate squad join rewards',
    actionType: 'SQUAD_JOIN',
    keyTemplate: 'squad_join_{userId}_{squadId}',
    keyVariables: ['userId', 'squadId'],
    timeWindow: 0, // Forever - can only join each squad once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 2,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'You have already joined this squad',
    },
    isActive: true,
    priority: 9,
  },

  {
    id: 'reward-claim-dedup',
    name: 'Reward Claim Deduplication',
    description: 'Prevents duplicate reward claim attempts',
    actionType: 'REWARD_CLAIM',
    keyTemplate: 'reward_claim_{userId}_{rewardId}',
    keyVariables: ['userId', 'rewardId'],
    timeWindow: 0, // Forever - each reward can only be claimed once
    resetSchedule: 'NONE',
    conditions: {
      minLevel: 1,
      maxLevel: null,
      requiredEntitlements: [],
      excludedFromEvents: false,
    },
    actions: {
      blockDuplicate: true,
      warnOnAttempt: false,
      logAttempt: true,
      customMessage: 'This reward has already been claimed',
    },
    isActive: true,
    priority: 10,
  },
];