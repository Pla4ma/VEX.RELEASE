import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Content Study Analytics
 * Comprehensive tracking for user behavior, engagement, and performance metrics
 */

import type { ContentStudyAnalyticsEvent, ContentStudyAnalyticsEventName, ContentStudyMetrics, ContentSourceType, ContentStudyErrorCode } from './types';
import { CONTENT_STUDY_CONSTANTS } from './types';
import { getDefaultStorageAdapter } from '../../persistence';
import { createDebugger } from '../../utils/debug';

const getStorage = () => getDefaultStorageAdapter();
const debug = createDebugger('content-study:analytics');

// ============================================================================
// Analytics Service
// ============================================================================
// ============================================================================
// Predefined Tracking Functions
// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ============================================================================
// Metrics Aggregation
// ============================================================================
// ============================================================================
// React Hook
// ============================================================================

import { useCallback, useRef } from 'react';

export * from "./analytics.part1";
export * from "./analytics.part2";
export * from "./analytics.part3";
