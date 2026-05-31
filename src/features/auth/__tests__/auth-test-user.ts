import type { User } from '../../../types/models';

export const authTestUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  verified: true,
  role: 'moderator',
  status: 'active',
  preferences: {
    accessibility: {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      screenReaderOptimized: false,
    },
    language: 'en',
    notifications: {
      digestFrequency: 'daily',
      email: false,
      inApp: true,
      push: true,
      quietHours: {
        enabled: false,
        end: '07:00',
        start: '22:00',
        timezone: 'UTC',
      },
      sms: false,
    },
    privacy: {
      activityStatus: true,
      allowMentions: true,
      allowTagging: true,
      dataSharing: false,
      profileVisibility: 'private',
      readReceipts: false,
    },
    theme: 'system',
  },
  metadata: { deviceHistory: [], loginCount: 1 },
};
