/**
 * Supabase Auth Service
 *
 * Authentication using Supabase Auth.
 */

import { getSupabaseClient, handleSupabaseError } from '../config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types/models';
import { capture } from '../shared/analytics/analytics-service';
import { AuthEvents } from '../shared/analytics/analytics-events';

/**
 * Map Supabase user to VEX User type
 */
function mapSupabaseUser(
  sbUser: SupabaseUser,
  overrideMetadata?: { firstName: string; lastName: string }
): User {
  const now = new Date().toISOString();
  const metadata = sbUser.user_metadata || {};

  const firstName = overrideMetadata?.firstName || metadata.first_name || '';
  const lastName = overrideMetadata?.lastName || metadata.last_name || '';
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : sbUser.email?.split('@')[0] || '';

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    username: metadata.username || sbUser.email?.split('@')[0] || '',
    firstName,
    lastName,
    displayName,
    squadId: metadata.squad_id || metadata.squadId || null,
    avatar: metadata.avatar_url || undefined,
    bio: metadata.bio || undefined,
    verified: Boolean(metadata.verified),
    role: metadata.role || 'user',
    status: 'active',
    preferences: {
      theme: metadata.theme || 'system',
      language: metadata.language || 'en',
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
    metadata: {
      lastLoginAt: sbUser.last_sign_in_at || now,
      loginCount: metadata.login_count || 1,
      deviceHistory: [],
    },
    createdAt: sbUser.created_at || now,
    updatedAt: sbUser.updated_at || now,
  };
}

export * from "./supabaseAuth.part1";
