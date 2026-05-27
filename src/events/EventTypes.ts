/**
 * Event Types (Barrel Export)
 *
 * Re-exports all event types from the types/ directory.
 * This file exists for backward compatibility.
 */

export * from "./types";

// Import types for local use (avoiding circular deps)
import type { ThemeMode } from "../theme/types";
import type { AppError } from "../types/global";
import type { NavigationEvent, RouteName } from "../types/navigation";
import type { User } from "../types/models";

// Theme change event (defined locally to avoid circular dependency)
export interface ThemeChangeEvent {
  mode: ThemeMode;
  previousMode?: ThemeMode;
  timestamp: number;
}

// Legacy alias exports for backward compatibility
export type { ThemeChangeEvent as ThemeChangeEventType };
export type { AppError as AppErrorType };
export type { NavigationEvent as NavigationEventType };
export type { RouteName as RouteNameType };
export type { User as UserType };
