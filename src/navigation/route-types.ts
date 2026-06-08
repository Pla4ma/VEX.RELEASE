import type { Nullable } from '../types/global';

export type RootStackRoute =
  | 'Main'
  | 'Auth'
  | 'Onboarding'
  | 'Paywall'
  | 'Splash'
  | 'Settings'
  | 'SessionStack'
  | 'CompanionDetail'
  | 'Comeback'
  | 'StreakFuneral'
  | 'FocusScoreDashboard'
  | 'VipPaywall'
  | 'MemoryConsole'
  | 'Rivals'
  | 'Search'
  | 'Vault';

export type AuthStackRoute =
  | 'Login'
  | 'Register'
  | 'ForgotPassword'
  | 'ResetPassword'
  | 'VerifyEmail';

export type MainTabRoute = 'Home' | 'Focus' | 'Progress' | 'Profile';

export type SettingsStackRoute =
  | 'SettingsMain'
  | 'AccountSettings'
  | 'NotificationSettings'
  | 'PrivacySettings'
  | 'AppearanceSettings'
  | 'DataExport'
  | 'CoachSettings'
  | 'LaneMode';

export type SessionStackRoute =
  | 'SessionSetup'
  | 'ActiveSession'
  | 'SessionComplete'
  | 'SessionHistory';

export type SessionSetupMode =
  | 'LIGHT_FOCUS'
  | 'DEEP_WORK'
  | 'SPRINT'
  | 'CREATIVE'
  | 'STUDY'
  | 'RECOVERY';

export interface ComebackContext {
  comebackMessage?: string;
  comebackMultiplier?: number;
  comebackQuest?: { requiredSessions: number; streakBefore: number } | null;
}

export interface StudyContext {
  contentId?: string;
  focusAreas?: string[];
  generationId?: string;
  goal?: string;
  studyPlanId?: string;
  suggestedDifficulty?: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  suggestedDurationSeconds?: number;
}

export interface WarContext {
  warContext?: { squadId: string; squadWarId: string } | null;
}

export type MainStackRoute =
  | 'Boss'
  | 'Notifications'
  | 'ContentStudy'
  | 'AICoach'
  | 'Challenges'
  | 'Mastery'
  | 'CompanionDetail'
  | 'MemoryConsole'
  | 'Achievements'
  | 'Analytics';

export interface NavigationState {
  currentRoute: string;
  isNavigating: boolean;
  params: Record<string, object | undefined>;
  previousRoute: Nullable<string>;
  routeHistory: string[];
}
