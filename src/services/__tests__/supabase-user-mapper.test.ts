import { describe, expect, it } from '@jest/globals';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  mapSupabaseUser,
} from '../supabase-user-mapper';

function createMockSupabaseUser(overrides: {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
} = {}): SupabaseUser {
  return {
    id: 'usr-123',
    email: 'test@example.com',
    user_metadata: {},
    last_sign_in_at: '2025-01-15T12:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T12:00:00Z',
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
    ...overrides,
  } as SupabaseUser;
}

describe('mapSupabaseUser', () => {
  it('maps basic user correctly', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    expect(user.id).toBe('usr-123');
    expect(user.email).toBe('test@example.com');
    expect(user.status).toBe('active');
  });

  it('extracts firstName and lastName from metadata', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { first_name: 'Jonny', last_name: 'Test' },
      })
    );
    expect(user.firstName).toBe('Jonny');
    expect(user.lastName).toBe('Test');
    expect(user.displayName).toBe('Jonny Test');
  });

  it('uses email prefix as displayName when no name metadata', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        email: 'jane@example.com',
      })
    );
    expect(user.displayName).toBe('jane');
  });

  it('uses override metadata when provided', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { first_name: 'Meta', last_name: 'Data' },
      }),
      { firstName: 'Override', lastName: 'Name' }
    );
    expect(user.firstName).toBe('Override');
    expect(user.lastName).toBe('Name');
    expect(user.displayName).toBe('Override Name');
  });

  it('derives username from metadata or email', () => {
    const user1 = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { username: 'custom_user' },
      })
    );
    expect(user1.username).toBe('custom_user');

    const user2 = mapSupabaseUser(
      createMockSupabaseUser({
        email: 'plain@example.com',
      })
    );
    expect(user2.username).toBe('plain');
  });

  it('maps squad_id from metadata', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { squad_id: 'squad-42' },
      })
    );
    expect(user.squadId).toBe('squad-42');
  });

  it('defaults squadId to null when not in metadata', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    expect(user.squadId).toBeNull();
  });

  it('maps avatar and bio from metadata', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { avatar_url: 'https://img.com/a.png', bio: 'Hello!' },
      })
    );
    expect(user.avatar).toBe('https://img.com/a.png');
    expect(user.bio).toBe('Hello!');
  });

  it('defaults avatar and bio to undefined', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    expect(user.avatar).toBeUndefined();
    expect(user.bio).toBeUndefined();
  });

  it('sets verified from metadata', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { verified: true },
      })
    );
    expect(user.verified).toBe(true);
  });

  it('defaults role to user', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    expect(user.role).toBe('user');
  });

  it('maps role from metadata', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { role: 'admin' },
      })
    );
    expect(user.role).toBe('admin');
  });

  it('sets default preferences', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
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
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        user_metadata: { theme: 'dark', language: 'fr' },
      })
    );
    expect(user.preferences.theme).toBe('dark');
    expect(user.preferences.language).toBe('fr');
  });

  it('sets onboardingCompletedAt to null', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    expect(user.onboardingCompletedAt).toBeNull();
  });

  it('preserves Supabase timestamps', () => {
    const user = mapSupabaseUser(
      createMockSupabaseUser({
        last_sign_in_at: '2025-03-01T00:00:00Z',
        created_at: '2024-06-15T00:00:00Z',
        updated_at: '2025-03-10T00:00:00Z',
      })
    );
    expect(user.metadata.lastLoginAt).toBe('2025-03-01T00:00:00Z');
    expect(user.createdAt).toBe('2024-06-15T00:00:00Z');
    expect(user.updatedAt).toBe('2025-03-10T00:00:00Z');
  });

  it('handles empty email', () => {
    const user = mapSupabaseUser(createMockSupabaseUser({ email: '' }));
    expect(user.email).toBe('');
    expect(user.username).toBe('');
  });
});