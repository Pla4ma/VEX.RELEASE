import React, { memo, useRef, useEffect } from "react";
import { createDebugger } from "../../utils/debug";
const debug = createDebugger("performance");
export function lazyScreen<
  T extends React.ComponentType<Record<string, unknown>>,
>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> & { preload: () => Promise<void> } {
  const Component = React.lazy(factory) as React.LazyExoticComponent<T> & {
    preload: () => Promise<void>;
  };
  Component.preload = async () => {
    try {
      await factory();
    } catch (error) {
      debug.warn(
        "Failed to preload screen",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
  return Component;
}
export function preloadCriticalScreens(
  screens: Array<() => Promise<void>>,
): void {
  const schedule =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? window.requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 1);
  schedule(() => {
    screens.forEach((preload, index) => {
      setTimeout(() => preload(), index * 100);
    });
  });
}
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>({
    deps: [],
    value: undefined as T,
  });
  const isEqual = deps.every((dep, i) => {
    const prevDep = ref.current.deps[i];
    if (typeof dep === "object" && dep !== null) {
      return JSON.stringify(dep) === JSON.stringify(prevDep);
    }
    return dep === prevDep;
  });
  if (!isEqual) {
    ref.current = { deps, value: factory() };
  }
  return ref.current.value;
}
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  _deps: React.DependencyList,
): T {
  const callbackRef = useRef(callback);
  const stableCallbackRef = useRef<T | null>(null);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  if (!stableCallbackRef.current) {
    stableCallbackRef.current = ((...args) =>
      callbackRef.current(...args)) as T;
  }
  return stableCallbackRef.current;
}
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 100;
export function recordMetric(
  name: string,
  duration: number,
  metadata?: Record<string, unknown>,
): void {
  metrics.push({ name, duration, timestamp: Date.now(), metadata });
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
}
export function measure<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>,
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  recordMetric(name, duration, metadata);
  return result;
}
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  recordMetric(name, duration, metadata);
  return result;
}
interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {},
): string {
  const { maxWidth = 800, quality = 80 } = options;
  if (originalUrl.includes("supabase")) {
    const url = new URL(originalUrl);
    url.searchParams.set("width", maxWidth.toString());
    url.searchParams.set("quality", quality.toString());
    return url.toString();
  }
  return originalUrl;
}
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    }),
  );
}
export function shouldEnableFeature(featureName: string): boolean {
  interface NetworkInfo {
    effectiveType?: string;
    saveData?: boolean;
  }
  interface NavigatorDevice extends Navigator {
    deviceMemory?: number;
    connection?: NetworkInfo;
  }
  const memory = (navigator as NavigatorDevice).deviceMemory || 4;
  const connection = (navigator as NavigatorDevice).connection;
  if (memory < 2) {
    const heavyFeatures = ["animations", "analytics", "heavy-graphics"];
    if (heavyFeatures.includes(featureName)) {
      return false;
    }
  }
  if (connection?.effectiveType === "2g" || connection?.saveData) {
    return false;
  }
  return true;
}
export { memo };
export type { PerformanceMetric, ImageOptimizationOptions };
