import React from 'react';

export interface ScreenErrorConfig {
  screenName: string;
  isCritical: boolean;
  errorMessages?: Partial<Record<string, string>>;
  recoveryTarget?: string;
  preserveState?: boolean;
  fallback?: React.ReactNode;
}

export type ScreenType =
  | 'session'
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

export interface ScreenErrorWrapperProps {
  children: React.ReactNode;
  screenType: ScreenType;
  customConfig?: Partial<ScreenErrorConfig>;
}

export interface ScreenErrorRecoveryOptions {
  autoRecover?: boolean;
  recoveryDelay?: number;
  onRecovery?: (screenType: ScreenType, error: Error) => void;
}
