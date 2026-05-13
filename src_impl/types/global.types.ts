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
 * Type for sort configuration
 */
export interface SortConfig<T> {
    key: keyof T;
    direction: SortDirection;
}

/**
 * Type for filter configuration
 */
export interface FilterConfig<T> {
    key: keyof T;
    operator: FilterOperator;
    value: unknown;
}

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
export interface BaseComponentProps extends WithOptionalChildren, WithTestID, WithAccessibilityLabel {
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
