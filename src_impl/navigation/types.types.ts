/**
 * Session stack params
 */
export interface SessionStackParams {
    [key: string]: object | undefined;
    SessionSetup: {
        presetId?: string;
        presetDuration?: number;
        presetMode?: 'LIGHT_FOCUS' | 'DEEP_WORK' | 'SPRINT' | 'CREATIVE' | 'STUDY';
        selectedThemeId?: string;
        goal?: string;
        suggestedDurationSeconds?: number;
        suggestedDifficulty?: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
        recommendationId?: string;
        comebackMultiplier?: number;
        comebackMessage?: string;
        comebackQuest?: {
          streakBefore: number;
          requiredSessions: number;
        } | null;
        warContext?: {
          squadWarId: string;
          squadId: string;
        } | null;
        // Content Study integration
        focusAreas?: string[];
        source?: 'content-study' | 'onboarding_first_session';
        generationId?: string;
        contentId?: string;
        studyPlanId?: string;
        sessionCategory?: string;
        sessionTags?: string[];
        };
    ActiveSession: { sessionId: string; selectedThemeId?: string };
    SessionComplete: { sessionId: string; summary: unknown };
    SessionHistory: undefined;
}

/**
 * Root stack params
 */
export interface RootStackParams {
    [key: string]: object | undefined;
    Auth: { screen?: AuthStackRoute };
    Onboarding: { step?: number };
    Paywall: { source?: string; gatedFeature?: string };
    VipPaywall: { source?: string; gemCount?: number };
    Splash: undefined;
    Settings: { screen?: SettingsStackRoute };
    SessionStack: { screen: SessionStackRoute; params?: SessionStackParams[SessionStackRoute] };
    CompanionDetail: undefined;
    Comeback: { comebackState: ComebackState };
    StreakFuneral: { previousStreak: number; diedAt: number };
    FocusScoreDashboard: undefined;
    PostSessionStory: { sessionId: string; focusScore?: number; purityScore?: number; summary?: import('../session/types').SessionSummary };
}

/**
 * Auth stack params
 */
export interface AuthStackParams {
    [key: string]: object | undefined;
    Login: { email?: string; returnTo?: string };
    Register: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
    VerifyEmail: { email: string };
}

/**
 * Main tab params - Launch structure
 */
export interface MainTabParams {
    [key: string]: object | undefined;
    Home: undefined;
    Focus: undefined;
    Progress: undefined;
    Profile: { userId?: string; tab?: 'stats' | 'achievements' | 'activity' | 'social' };
}

/**
 * Main stack params for feature module screens
 */
export interface MainStackParams {
    [key: string]: object | undefined;
    Boss: undefined;
    Guild: { guildId?: string } | undefined;
    BattlePass: undefined;
    Shop: undefined;
    Inventory: undefined;
    Notifications: undefined;
    Search: { query?: string };
    Analytics: { month?: string };
    ContentStudy: NavigatorScreenParams<ContentStudyStackParamList> | undefined;
    ContentReview: { contentId: string };
    StudyPlan: { generationId: string; contentId: string };
    ContentInput: undefined;
    Coach: undefined;
    AICoach: undefined;
    Challenges: undefined;
    Mastery: undefined;
    Vault: undefined;
    Leaderboard: { period?: 'DAILY' | 'WEEKLY' | 'MONTHLY'; scope?: 'GLOBAL' | 'FRIENDS' } | undefined;
    PostSessionStory: { sessionId: string; focusScore?: number; purityScore?: number; summary?: import('../session/types').SessionSummary };
    MonthlyFocusReport: { month?: number; year?: number } | undefined;
}

/**
 * Settings stack params
 */
export interface SettingsStackParams {
    [key: string]: object | undefined;
    SettingsMain: undefined;
    AccountSettings: undefined;
    NotificationSettings: undefined;
    PrivacySettings: undefined;
    AppearanceSettings: undefined;
    CoachSettings: undefined;
}

/**
 * Screen options factory
 */
export interface ScreenOptionsFactory {
    (props: { route: { name: string }; navigation: unknown }): | NativeStackNavigationOptions
        | BottomTabNavigationOptions;
}

/**
 * Navigation state
 */
export interface NavigationState {
    currentRoute: string;
    previousRoute: Nullable<string>;
    params: Record<string, unknown>;
    routeHistory: string[];
    isNavigating: boolean;
}
