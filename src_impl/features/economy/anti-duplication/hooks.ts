/**
 * Anti-Duplication Hooks
 *
 * Phase 6.04 - Anti-Duplication Systems
 * React hooks for UI integration with anti-duplication validation
 * Provides real-time feedback and exploit detection warnings
 *
 * Dependencies:
 * - Economy (reward tracking, transaction validation)
 * - Rewards (reward delivery, claim tracking)
 * - Analytics (duplication detection, Sentry reporting)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { eventBus } from '../../../events';
import { antiDuplicationService } from './deduplication-service';
import type {
  DeduplicationRequest,
  DeduplicationResult,
  DeduplicationAttempt,
  ExploitDetection,
  DeduplicationAnalytics,
} from './schemas';

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Deduplication Validation Hook
// ============================================================================

interface UseValidateDeduplicationOptions {
  onSuccess?: (result: DeduplicationResult) => void;
  onError?: (error: Error) => void;
  onDuplicate?: (result: DeduplicationResult) => void;
  onExploit?: (detection: ExploitDetection) => void;
}

// ============================================================================
// Action Validation Hook
// ============================================================================

interface UseActionValidationProps {
  userId: string;
  actionType: string;
  userLevel: number;
  isPremiumUser: boolean;
}

// ============================================================================
// Deduplication Attempts Hook
// ============================================================================

interface DeduplicationAttemptsData {
  attempts: DeduplicationAttempt[];
  totalCount: number;
  allowedCount: number;
  blockedCount: number;
  errorCount: number;
}

interface UseDeduplicationAttemptsProps {
  userId: string;
  period?: 'hour' | 'day' | 'week';
}

// ============================================================================
// Exploit Detection Hook
// ============================================================================

interface ExploitDetectionData {
  detections: ExploitDetection[];
  totalCount: number;
  resolvedCount: number;
  pendingCount: number;
  highSeverityCount: number;
}

interface UseExploitDetectionProps {
  userId: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ============================================================================
// Deduplication Rules Hook
// ============================================================================
// ============================================================================
// Deduplication Analytics Hook
// ============================================================================

interface UseDeduplicationAnalyticsProps {
  userId: string;
  period: 'HOURLY' | 'DAILY' | 'WEEKLY';
}

// ============================================================================
// Duplicate Warning Hook
// ============================================================================
// ============================================================================
// Exploit Alert Hook
// ============================================================================
// ============================================================================
// Action Status Hook
// ============================================================================

interface UseActionStatusProps {
  userId: string;
  actionType: string;
}

// ============================================================================
// Anti-Duplication Event Handlers Hook
// ============================================================================
export * from "./hooks.types";
export * from "./hooks.types";
export * from "./hooks.part1";
export * from "./hooks.part2";
export * from "./hooks.part3";
