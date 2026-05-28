import { jest } from "@jest/globals";
import {
  PerformanceGate,
  performanceGate,
  PRODUCTION_TARGETS,
  DEVELOPMENT_TARGETS,
  type PerformanceGateResult,
  type PerformanceTargets,
} from "../PerformanceGate";

export const mockPerformanceMonitor = {
  start: jest.fn(),
  stop: jest.fn(),
  getMetrics: jest.fn(() => ({
    fps: 60,
    avgFps: 58,
    jankFrames: 2,
    memoryUsage: 120,
    jsHeapSize: 50,
    longTasks: 1,
    timestamp: Date.now(),
  })),
  onJank: jest.fn(),
};

export const mockFetch = jest.fn();
Object.defineProperty(global, "fetch", { value: mockFetch, writable: true });

export const mockRequestAnimationFrame = jest.fn();
Object.defineProperty(global, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
  writable: true,
});

export {
  PerformanceGate,
  performanceGate,
  PRODUCTION_TARGETS,
  DEVELOPMENT_TARGETS,
  type PerformanceGateResult,
  type PerformanceTargets,
};
