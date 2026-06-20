import type {
  NotificationContext as SmartNotificationContext,
} from '../SmartNotificationSystem.types';
import type {
  NotificationContext as ServiceNotificationContext,
} from '../service-types';

// ─── MOCKS ────────────────────────────────────────────────────────────────

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'DATE' },
}));

// Mock Supabase
const mockFrom = jest.fn();
const mockChannel = jest.fn();
const mockSupabaseClient = {
  from: mockFrom,
  channel: mockChannel,
};

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

// Mock eventBus — service.ts imports from EventBus directly, not the index
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn() },
}));

// Mock analytics
const mockTrack = jest.fn();
jest.mock('../../../analytics/AnalyticsService', () => ({
  getAnalyticsService: jest.fn(() => ({ track: mockTrack })),
}));

// Mock sentry
jest.mock('../../../config/sentry', () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// Mock debug
jest.mock('../../../utils/debug', () => ({
  createDebugger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

// Mock MMKV
jest.mock('../../../persistence/MMKVStorageAdapter', () => {
  const store: Record<string, string> = {};
  return {
    MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
      getItemSync: jest.fn((key: string) => store[key] ?? null),
      setItemSync: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
    })),
  };
});

// Mock uuid
jest.mock('../../../utils/uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

// Mock timezone utils
jest.mock('../../ai-coach/utils/timezone', () => ({
  getUserTimezone: jest.fn(() => 'America/New_York'),
  scheduleForLocalTime: jest.fn(
    (_hour: number, _min: number, _tz: string, baseDate?: Date) => {
      const d = baseDate ?? new Date();
      return d.getTime();
    },
  ),
}));

// Mock notification-policy
jest.mock('../../notification-policy/service', () => ({
  decideNudge: jest.fn(() => ({ allowed: true })),
}));

// Mock repository/shared
jest.mock('../repository/shared', () => {
  class RepositoryError extends Error {
    operation: string;
    originalError: unknown;
    constructor(operation: string, originalError: unknown) {
      super(
        `Repository error in ${operation}: ${
          originalError instanceof Error ? originalError.message : 'Unknown error'
        }`,
      );
      this.name = 'RepositoryError';
      this.operation = operation;
      this.originalError = originalError;
    }
  }
  const mockSupabase = {
    from: jest.fn(),
    channel: jest.fn(),
  };
  return { RepositoryError, supabase: mockSupabase };
});

// Mock repository submodules
jest.mock('../repository/notifications', () => ({
  fetchUnreadNotificationsCount: jest.fn(),
  fetchNotificationCenterItems: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  subscribeToNotificationCenter: jest.fn(),
}));

jest.mock('../repository/retention', () => ({
  fetchRetentionUserProfile: jest.fn(),
  upsertReminderPlan: jest.fn(),
  hasScheduledReminderWithin: jest.fn(),
  fetchChallengeExpiryCandidates: jest.fn(),
  fetchReEngagementCandidates: jest.fn(),
}));

jest.mock('../repository/push', () => ({
  upsertPushToken: jest.fn(),
}));

// ─── HELPERS ──────────────────────────────────────────────────────────────

function makeSmartCtx(
  overrides: Partial<SmartNotificationContext> = {},
): SmartNotificationContext {
  return {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    currentTime: Date.now(),
    streakDays: 5,
    hasCompletedSessionToday: false,
    hoursUntilStreakBreak: 3,
    hasActiveBoss: false,
    bossHealthPercent: 100,
    bossTimeRemaining: 0,
    isPrimeTime: false,
    hasActiveStudyPlan: false,
    studyPlanProgress: 0,
    studyTasksRemaining: 0,
    squadMemberCount: 0,
    squadWeeklyProgress: 0,
    squadGoalAchieved: false,
    lastSessionAt: Date.now() - 86400000,
    daysSinceLastSession: 1,
    sessionsThisWeek: 3,
    notificationPrefs: {
      streakProtectionEnabled: true,
      bossAlertsEnabled: true,
      studyRemindersEnabled: true,
      squadActivityEnabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
      maxPerDay: 3,
    },
    ...overrides,
  };
}

function makeServiceCtx(
  overrides: Partial<ServiceNotificationContext> = {},
): ServiceNotificationContext {
  return {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    streakRisk: {
      hoursRemaining: 2,
      streakDays: 5,
      riskLevel: 'HIGH',
    },
    ...overrides,
  };
}

export { mockFrom, mockChannel, mockSupabaseClient, mockTrack, makeSmartCtx, makeServiceCtx };
