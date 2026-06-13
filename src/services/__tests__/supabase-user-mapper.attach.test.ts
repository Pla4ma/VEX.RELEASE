import { describe, expect, it } from '@jest/globals';
import type { User as SupabaseUser } from '@supabase/supabase-js';
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

describe('attachOnboardingCompletion', () => {
  it('sets onboardingCompletedAt on user', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    const updated = attachOnboardingCompletion(user, '2025-01-20T00:00:00Z');
    expect(updated.onboardingCompletedAt).toBe('2025-01-20T00:00:00Z');
  });

  it('sets onboardingCompletedAt to null', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    const updated = attachOnboardingCompletion(user, null);
    expect(updated.onboardingCompletedAt).toBeNull();
  });

  it('preserves all other user properties', () => {
    const user = mapSupabaseUser(createMockSupabaseUser());
    const updated = attachOnboardingCompletion(user, '2025-01-20T00:00:00Z');
    expect(updated.id).toBe(user.id);
    expect(updated.email).toBe(user.email);
    expect(updated.firstName).toBe(user.firstName);
    expect(updated.lastName).toBe(user.lastName);
  });
});