import type { User } from '../../types/models/user';

export const DEV_BYPASS_USER_ID = '00000000-0000-0000-0000-000000000001';

export const createDevBypassUser = (): User => {
  const now = new Date().toISOString();

  return {
    id: DEV_BYPASS_USER_ID,
    createdAt: now,
    updatedAt: now,
    username: 'localdev',
    email: 'local-dev@vex.app',
    firstName: 'Local',
    lastName: 'Dev',
    displayName: 'Local Dev',
    verified: true,
    role: 'user',
    status: 'active',
    onboardingCompletedAt: now,
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: {
        push: false,
        email: false,
        sms: false,
        inApp: true,
        digestFrequency: 'never',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
          timezone: 'America/New_York',
        },
      },
      privacy: {
        profileVisibility: 'private',
        activityStatus: false,
        readReceipts: false,
        allowTagging: false,
        allowMentions: false,
        dataSharing: false,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderOptimized: false,
      },
    },
    metadata: {
      lastLoginAt: now,
      loginCount: 1,
      signupSource: 'dev-bypass',
      deviceHistory: [],
    },
  };
};
