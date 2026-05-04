/**
 * Global Type Definitions
 *
 * Core type definitions used across the entire application.
 * These types establish the foundational type system for VEX.
 */

import { type ReactNode } from 'react';

/**
 * Represents a value that may be null or undefined
 */
export type Nullable<T> = T | null | undefined;

/**
 * Represents a value that may be null
 */
export type Maybe<T> = T | null;

/**
 * Deep partial type for nested optional properties
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly type for immutable objects
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Type for object keys
 */
export type KeyOf<T> = keyof T;

/**
 * Type for object values
 */
export type ValueOf<T> = T[keyof T];

/**
 * Type for entries (key-value pairs)
 */
export type Entries<T> = [keyof T, T[keyof T]][];

/**
 * Strictly typed record with required keys
 */
export type StrictRecord<K extends keyof any, T> = Record<K, T>;

/**
 * Type for async function results
 */
export type AsyncResult<T, E = Error> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E };

/**
 * Type for loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Type for request states with data
 */
export type RequestState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | null; error: Error };

/**
 * Type for pagination data
 */
export interface PaginationData<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Type for sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Type for sort configuration
 */
export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * Type for filter operators
 */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'between';

/**
 * Type for filter configuration
 */
export interface FilterConfig<T> {
  key: keyof T;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Type for timer references
 */
export type TimeoutId = ReturnType<typeof setTimeout>;
export type IntervalId = ReturnType<typeof setInterval>;

/**
 * Type for function that returns void
 */
export type VoidFunction = () => void;

/**
 * Type for event handlers
 */
export type EventHandler<E = unknown> = (event: E) => void;

/**
 * Type for async event handlers
 */
export type AsyncEventHandler<E = unknown> = (event: E) => Promise<void>;

/**
 * Type for callback functions with parameters
 */
export type Callback<T = void> = T extends void
  ? () => void
  : (value: T) => void;

/**
 * Type for component with children
 */
export interface WithChildren {
  children: ReactNode;
}

/**
 * Type for component with optional children
 */
export interface WithOptionalChildren {
  children?: ReactNode;
}

/**
 * Type for component with style
 */
export interface WithStyle {
  style?: unknown;
}

/**
 * Type for component with test ID
 */
export interface WithTestID {
  testID?: string;
}

/**
 * Type for component with accessibility label
 */
export interface WithAccessibilityLabel {
  accessibilityLabel?: string;
}

/**
 * Combined base props type
 */
export interface BaseComponentProps
  extends WithOptionalChildren,
    WithTestID,
    WithAccessibilityLabel {
  style?: unknown;
}

/**
 * Type for error with code
 */
export interface AppError extends Error {
  code: string;
  details?: Record<string, unknown>;
  recoverable?: boolean;
}

/**
 * Type for validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Type for device information
 */
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'web';
  version: string;
  model: string;
  brand: string;
  isTablet: boolean;
  isEmulator: boolean;
}

/**
 * Type for app environment
 */
export type AppEnvironment = 'development' | 'staging' | 'production';

/**
 * Type for app configuration
 */
export interface AppConfig {
  environment: AppEnvironment;
  apiUrl: string;
  apiTimeout: number;
  version: string;
  buildNumber: string;
  bundleId: string;
}

/**
 * Type for dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Type for position
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Type for insets (safe area)
 */
export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Type for date range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Type for time duration
 */
export interface Duration {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

/**
 * Type for file metadata
 */
export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  uri: string;
  lastModified: Date;
}

/**
 * Type for coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Branding: Prevents type widening for string literals
 */
export type StringLiteral<T extends string> = T & { __brand: 'StringLiteral' };

/**
 * Type guard helper
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Extract promise resolve type
 */
export type Awaited<T> = T extends Promise<infer R> ? R : T;

/**
 * Non-nullable deep type
 */
export type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<DeepNonNullable<T[P]>>;
};
