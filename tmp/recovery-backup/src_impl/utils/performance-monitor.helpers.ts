
import { createDebugger } from './debug';
import { type PerformanceThresholds } from './performance-monitor.types';

export const debug = createDebugger('performance:monitor');

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 30,
  maxJankFrames: 5,
  maxMemoryMb: 200,
  maxLongTasks: 3,
};
