import { createDebugger } from "../utils/debug";
import { PerformanceMonitor, measureExecutionTime, measureAsyncExecutionTime, type PerformanceMetrics } from "../utils/performance-monitor";
import { eventBus } from "../events";
import type { EventChannels } from "../events/types";


export const performanceGate = PerformanceGate.getInstance();