/**
 * Performance Gate
 * 
 * Enforces performance targets for production readiness:
 * - FPS targets (60fps stable, 30fps minimum)
 * - Memory usage limits
 * - Animation performance
 * - Network request optimization
 * - Bundle size constraints
 */

import { createDebugger } from '../utils/debug';
import { PerformanceMonitor, measureExecutionTime, measureAsyncExecutionTime, type PerformanceMetrics } from '../utils/performance-monitor';
import { eventBus } from '../events';
import type { EventChannels } from '../events/types';

const debug = createDebugger('performance-gate');

// ============================================================================
// Performance Targets and Thresholds
// ============================================================================
// ============================================================================
// Performance Gate Class
// ============================================================================
// ============================================================================
// Export Singleton Instance
// ============================================================================
export * from "./PerformanceGate.types";
export * from "./PerformanceGate.part1";
export * from "./PerformanceGate.part2";
