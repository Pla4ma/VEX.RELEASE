import { useAuthStore } from './index';
import { setSentryUser, captureException } from '../config/sentry';

export function devLogin(): void {
  try {
    const store = useAuthStore.getState();
    if (typeof store.setUser === 'function') {
      const now = new Date().toISOString();
      store.setUser({
        id: 'dev-user-1',
        email: 'dev@vex.app',
        username: 'developer',
        firstName: 'Dev',
        lastName: 'User',
        displayName: 'Developer',
        bio: 'VEX Developer',
        verified: true,
        role: 'admin',
        status: 'active',
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            push: true,
            email: true,
            sms: false,
            inApp: true,
            digestFrequency: 'daily',
            quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' },
          },
          privacy: {
            profileVisibility: 'public',
            activityStatus: true,
            readReceipts: true,
            allowTagging: true,
            allowMentions: true,
            dataSharing: false,
          },
          accessibility: {
            reduceMotion: false,
            highContrast: false,
            largeText: false,
            screenReaderOptimized: false,
          },
        },
        metadata: { lastLoginAt: now, loginCount: 1, deviceHistory: [] },
        createdAt: now,
        updatedAt: now,
      });
      store.setLoading(false);
      store.setError(null);
      setSentryUser('dev-user-1', 'dev@vex.app');
    }
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'dev-auth' },
    });
  }
}
