import { describe, expect, it } from '@jest/globals';
import {
  mapSupabaseUser,
  attachOnboardingCompletion,
} from '../supabase-user-mapper';

function createMockSupabaseUser(overrides: {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
} = {}): Record<string, unknown> {
  return {
    id: 'usr-123',
    email: 'test@example.com',
    user_metadata: {},
    last_sign_in_at: '2025-01-15T12:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T12:00:00Z',
    ...overrides,
  };
}

describe('mapSupabaseUser', () => {
  it('maps basic user correctly', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    expect(user.id).toBe('usr-123');
    expect(user.email).toBe('test@example.com');
    expect(user.status).toBe('active');
  });

  it('extracts firstName and lastName from metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { first_name: 'Jonny', last_name: 'Test' },
    }) as any);
    expect(user.firstName).toBe('Jonny');
    expect(user.lastName).toBe('Test');
    expect(user.displayName).toBe('Jonny Test');
  });

  it('uses email prefix as displayName when no name metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      email: 'jane@example.com',
    }) as any);
    expect(user.displayName).toBe('jane');
  });

  it('uses override metadata when provided', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { first_name: 'Meta', last_name: 'Data' },
    }) as any, { firstName: 'Override', lastName: 'Name' });
    expect(user.firstName).toBe('Override');
    expect(user.lastName).toBe('Name');
    expect(user.displayName).toBe('Override Name');
  });

  it('derives username from metadata or email', () => {
    const user1 = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { username: 'custom_user' },
    }) as any);
    expect(user1.username).toBe('custom_user');

    const user2 = mapSupabaseUser(createMockSupabaseUser({
      email: 'plain@example.com',
    }) as any);
    expect(user2.username).toBe('plain');
  });

  it('maps squad_id from metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { squad_id: 'squad-42' },
    }) as any);
    expect(user.squadId).toBe('squad-42');
  });

  it('defaults squadId to null when not in metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    expect(user.squadId).toBeNull();
  });

  it('maps avatar and bio from metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { avatar_url: 'https://img.com/a.png', bio: 'Hello!' },
    }) as any);
    expect(user.avatar).toBe('https://img.com/a.png');
    expect(user.bio).toBe('Hello!');
  });

  it('defaults avatar and bio to undefined', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    expect(user.avatar).toBeUndefined();
    expect(user.bio).toBeUndefined();
  });

  it('sets verified from metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { verified: true },
    }) as any);
    expect(user.verified).toBe(true);
  });

  it('defaults role to user', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    expect(user.role).toBe('user');
  });

  it('maps role from metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { role: 'admin' },
    }) as any);
    expect(user.role).toBe('admin');
  });

  it('sets default preferences', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    expect(user.preferences.theme).toBe('system');
    expect(user.preferences.language).toBe('en');
    expect(user.preferences.notifications.push).toBe(true);
    expect(user.preferences.notifications.email).toBe(true);
    expect(user.preferences.notifications.sms).toBe(false);
    expect(user.preferences.notifications.digestFrequency).toBe('daily');
    expect(user.preferences.notifications.quietHours.enabled).toBe(false);
    expect(user.preferences.privacy.profileVisibility).toBe('public');
    expect(user.preferences.accessibility.reduceMotion).toBe(false);
  });

  it('maps theme from metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      user_metadata: { theme: 'dark', language: 'fr' },
    }) as any);
    expect(user.preferences.theme).toBe('dark');
    expect(user.preferences.language).toBe('fr');
  });

  it('sets onboardingCompletedAt to null', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    expect(user.onboardingCompletedAt).toBeNull();
  });

  it('preserves Supabase timestamps', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({
      last_sign_in_at: '2025-03-01T00:00:00Z',
      created_at: '2024-06-15T00:00:00Z',
      updated_at: '2025-03-10T00:00:00Z',
    }) as any);
    expect(user.metadata.lastLoginAt).toBe('2025-03-01T00:00:00Z');
    expect(user.createdAt).toBe('2024-06-15T00:00:00Z');
    expect(user.updatedAt).toBe('2025-03-10T00:00:00Z');
  });

  it('handles empty email', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({ email: '' }) as any);
    expect(user.email).toBe('');
    expect(user.username).toBe('');
  });
});

describe('attachOnboardingCompletion', () => {
  it('sets onboardingCompletedAt on user', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    const updated = attachOnboardingCompletion(user, '2025-01-20T00:00:00Z');
    expect(updated.onboardingCompletedAt).toBe('2025-01-20T00:00:00Z');
  });

  it('sets onboardingCompletedAt to null', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    const updated = attachOnboardingCompletion(user, null);
    expect(updated.onboardingCompletedAt).toBeNull();
  });

  it('preserves all other user properties', () => {
    const user = mapSupabaseUser(createMockSupabaseUser() as any);
    const updated = attachOnboardingCompletion(user, '2025-01-20T00:00:00Z');
    expect(updated.id).toBe(user.id);
    expect(updated.email).toBe(user.email);
    expect(updated.firstName).toBe(user.firstName);
    expect(updated.lastName).toBe(user.lastName);
  });
});
