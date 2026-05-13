/**
 * AI Coach Realtime Hooks
 *
 * Supabase realtime subscriptions for live coach updates
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../../config/supabase';
import {
  type CoachMessage,
  type CoachState,
  type ComebackPlan,
  type SessionRecommendation,
} from './schemas';
import { COACH_QUERY_KEYS } from './hooks-enhanced';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('coach:realtime');

// ============================================================================
// Realtime Subscription Hook
// ============================================================================
// ============================================================================
// Combined Realtime Hook
// ============================================================================
// ============================================================================
// Helpers
// ============================================================================

function subscribeToMessages(userId: string) {
  const supabase = getSupabaseClient();
  return supabase['channel'](`coach-messages-${userId}`);
}

async function showLocalNotification(message: CoachMessage) {
  // Implementation would use expo-notifications
  // This is a placeholder for the actual implementation
  debug.info('[Coach Notification]', message.content);
}

export * from "./hooks-realtime.part1";
export * from "./hooks-realtime.part2";
