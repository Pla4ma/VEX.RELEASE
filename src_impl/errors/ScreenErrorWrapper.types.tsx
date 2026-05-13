export interface ScreenErrorConfig {
    screenName: string;
    isCritical: boolean;
    errorMessages?: Partial<Record<string, string>>;
    recoveryTarget?: string;
    preserveState?: boolean;
    fallback?: React.ReactNode;
}

export interface ScreenErrorWrapperProps {
    children: React.ReactNode;
    screenType: ScreenType;
    customConfig?: Partial<ScreenErrorConfig>;
}

export interface ScreenErrorRecoveryOptions {
    /** Whether to attempt automatic recovery */
    autoRecover?: boolean;
    /** Recovery delay in milliseconds */
    recoveryDelay?: number;
    /** Custom recovery handler */
    onRecovery?: (screenType: ScreenType, error: Error) => void;
}

export type ScreenType = | 'session'
      | 'session-complete'
      | 'home'
      | 'rewards'
      | 'streaks'
      | 'progression'
      | 'profile'
      | 'settings'
      | 'boss'
      | 'challenges'
      | 'squads';
