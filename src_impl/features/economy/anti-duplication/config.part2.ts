import type { DeduplicationRule, ExploitPattern, AntiDuplicationConfig } from "./schemas";


export const DEFAULT_EXPLOIT_PATTERNS: ExploitPattern[] = [
  {
    id: 'rapid-session-completion',
    name: 'Rapid Session Completion',
    description: 'Detects unrealistic rapid session completion',
    pattern: 'RAPID_REPEAT_ACTIONS',
    criteria: {
      timeWindow: 300, // 5 minutes
      maxAttempts: 5,
      actionTypes: ['SESSION_COMPLETE'],
      minLevel: 1,
      suspiciousThreshold: 0.8,
    },
    actions: {
      block: false,
      flagForReview: true,
      temporaryRestriction: false,
      notifyAdmins: true,
      customMessage: 'Unusual activity detected. Sessions are being completed too quickly.',
    },
    isActive: true,
    priority: 1,
  },

  {
    id: 'simultaneous-sessions',
    name: 'Simultaneous Sessions',
    description: 'Detects multiple sessions running simultaneously',
    pattern: 'SIMULTANEOUS_SESSIONS',
    criteria: {
      timeWindow: 60, // 1 minute
      maxAttempts: 2,
      actionTypes: ['SESSION_COMPLETE'],
      minLevel: 1,
      suspiciousThreshold: 0.9,
    },
    actions: {
      block: true,
      flagForReview: true,
      temporaryRestriction: true,
      notifyAdmins: true,
      customMessage: 'Multiple sessions detected. Please complete one session at a time.',
    },
    isActive: true,
    priority: 2,
  },

  {
    id: 'time-travel-detection',
    name: 'Time Travel Detection',
    description: 'Detects impossible timestamps (e.g., completing sessions in the past)',
    pattern: 'TIME_TRAVEL',
    criteria: {
      timeWindow: 86400, // 24 hours
      maxAttempts: 1,
      actionTypes: ['SESSION_COMPLETE', 'DAILY_LOGIN'],
      minLevel: 1,
      suspiciousThreshold: 0.95,
    },
    actions: {
      block: true,
      flagForReview: true,
      temporaryRestriction: true,
      notifyAdmins: true,
      customMessage: 'Invalid timestamp detected. Please check your device time.',
    },
    isActive: true,
    priority: 3,
  },

  {
    id: 'unrealistic-progress',
    name: 'Unrealistic Progress',
    description: 'Detects impossible progress patterns',
    pattern: 'UNREALISTIC_PROGRESS',
    criteria: {
      timeWindow: 3600, // 1 hour
      maxAttempts: 10,
      actionTypes: ['LEVEL_UP', 'ACHIEVEMENT_UNLOCK'],
      minLevel: 1,
      suspiciousThreshold: 0.7,
    },
    actions: {
      block: false,
      flagForReview: true,
      temporaryRestriction: false,
      notifyAdmins: false,
      customMessage: null,
    },
    isActive: true,
    priority: 4,
  },

  {
    id: 'duplicate-context-keys',
    name: 'Duplicate Context Keys',
    description: 'Detects attempts to use the same context key multiple times',
    pattern: 'DUPLICATE_CONTEXT_KEYS',
    criteria: {
      timeWindow: 60, // 1 minute
      maxAttempts: 3,
      actionTypes: ['SESSION_COMPLETE', 'QUEST_COMPLETE'],
      minLevel: 1,
      suspiciousThreshold: 0.8,
    },
    actions: {
      block: true,
      flagForReview: true,
      temporaryRestriction: false,
      notifyAdmins: true,
      customMessage: 'Duplicate action detected. Each action can only be completed once.',
    },
    isActive: true,
    priority: 5,
  },

  {
    id: 'manipulated-metadata',
    name: 'Manipulated Metadata',
    description: 'Detects suspicious or manipulated metadata',
    pattern: 'MANIPULATED_METADATA',
    criteria: {
      timeWindow: 300, // 5 minutes
      maxAttempts: 5,
      actionTypes: ['SESSION_COMPLETE'],
      minLevel: 1,
      suspiciousThreshold: 0.6,
    },
    actions: {
      block: false,
      flagForReview: true,
      temporaryRestriction: false,
      notifyAdmins: false,
      customMessage: null,
    },
    isActive: true,
    priority: 6,
  },
];

export const DEFAULT_ANTI_DUPLICATION_CONFIG: AntiDuplicationConfig = {
  enableDeduplication: true,
  enableExploitDetection: true,
  enableAnalytics: true,

  defaultRules: DEFAULT_DEDUPLICATION_RULES,

  exploitPatterns: DEFAULT_EXPLOIT_PATTERNS,

  keyRetentionDays: 90,
  attemptRetentionDays: 30,
  cleanupIntervalHours: 24,

  maxValidationTime: 1000, // 1 second
  enableCaching: true,
  cacheTTL: 300, // 5 minutes
};