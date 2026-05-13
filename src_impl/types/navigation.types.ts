/**
 * Navigation state tracking
 */
export interface NavigationState {
    currentRoute: RouteName;
    previousRoute?: RouteName;
    routeHistory: RouteName[];
    params?: Record<string, unknown>;
    timestamp: string;
}

/**
 * Deep link configuration
 */
export interface DeepLinkConfig {
    prefix: string;
    screens: Record<string, string>;
}

/**
 * Navigation animation preferences
 */
export interface NavigationAnimation {
    enabled: boolean;
    type: 'slide' | 'fade' | 'scale' | 'none';
    duration: number;
}

/**
 * Screen transition options
 */
export interface ScreenTransitionOptions {
    animation?: NavigationAnimation;
    gestureEnabled?: boolean;
    headerShown?: boolean;
    presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal';
}

/**
 * Tab bar configuration
 */
export interface TabBarConfig {
    visible: boolean;
    activeTintColor: string;
    inactiveTintColor: string;
    showLabels: boolean;
    style: 'default' | 'floating' | 'compact';
}

/**
 * Header configuration
 */
export interface HeaderConfig {
    visible: boolean;
    title?: string;
    showBackButton?: boolean;
    showCloseButton?: boolean;
    rightActions?: HeaderAction[];
    transparent?: boolean;
    blurEffect?: boolean;
}

/**
 * Header action definition
 */
export interface HeaderAction {
    id: string;
    icon: string;
    label: string;
    onPress: () => void;
    badge?: number;
    disabled?: boolean;
}

/**
 * Navigation guard check result
 */
export interface GuardCheckResult {
    allowed: boolean;
    redirectTo?: keyof RootStackParamList;
    message?: string;
    requiresAction?: boolean;
}

/**
 * Navigation event payload
 */
export interface NavigationEvent {
    type: NavigationEventType;
    route: RouteName;
    timestamp: string;
    data?: Record<string, unknown>;
}

/**
 * Navigation analytics data
 */
export interface NavigationAnalytics {
    screenName: string;
    screenClass: string;
    previousScreen?: string;
    timeOnScreen: number;
    params?: Record<string, unknown>;
}
