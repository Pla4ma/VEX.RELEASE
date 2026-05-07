/**
 * PHASE 8 Feature Flag Matrix
 * 
 * Complete feature configuration for launch with proper categorization.
 * Features are categorized as: core (enabled), optional (conditional), or disabled.
 */

export interface FeatureConfig {
  enabled: boolean;
  optional: boolean;
  disabled: boolean;
  description: string;
  launchScope: 'core' | 'optional' | 'disabled';
}

export const FEATURE_FLAGS: Record<string, FeatureConfig> = {
  // ============================================================================
  // CORE FEATURES (12) - Always enabled for launch
  // ============================================================================
  sessions: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Core focus session functionality - essential for app',
    launchScope: 'core',
  },
  'focus-timer': {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Timer and focus tracking - core feature',
    launchScope: 'core',
  },
  streaks: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Daily streak tracking - core retention feature',
    launchScope: 'core',
  },
  rewards: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Basic reward system - core motivation feature',
    launchScope: 'core',
  },
  progression: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'User progression and leveling - core feature',
    launchScope: 'core',
  },
  achievements: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Achievement system - core gamification',
    launchScope: 'core',
  },
  'ai-coach': {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'AI coaching and recommendations - core feature',
    launchScope: 'core',
  },
  notifications: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Push notifications - core engagement feature',
    launchScope: 'core',
  },
  settings: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'App settings and preferences - core feature',
    launchScope: 'core',
  },
  profile: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'User profile management - core feature',
    launchScope: 'core',
  },
  analytics: {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Analytics and insights - core feature',
    launchScope: 'core',
  },
  'offline-support': {
    enabled: true,
    optional: false,
    disabled: false,
    description: 'Offline functionality - core reliability feature',
    launchScope: 'core',
  },

  // ============================================================================
  // OPTIONAL FEATURES (4) - Ship if stable and improve core loop
  // ============================================================================
  boss: {
    enabled: false,
    optional: true,
    disabled: false,
    description: 'Solo boss battles - optional engagement feature',
    launchScope: 'optional',
  },
  challenges: {
    enabled: false,
    optional: true,
    disabled: false,
    description: 'Daily and weekly challenges - optional variety feature',
    launchScope: 'optional',
  },
  squads: {
    enabled: false,
    optional: true,
    disabled: false,
    description: 'Private squad accountability - optional social feature',
    launchScope: 'optional',
  },
  'monthly-report': {
    enabled: false,
    optional: true,
    disabled: false,
    description: 'Monthly progress reports - optional insight feature',
    launchScope: 'optional',
  },

  // ============================================================================
  // DISABLED FEATURES (9) - Explicitly disabled for launch
  // ============================================================================
  'social-feed': {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Social media feed - disabled for launch',
    launchScope: 'disabled',
  },
  duels: {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Player duels - disabled for launch',
    launchScope: 'disabled',
  },
  rankings: {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Global rankings - disabled for launch',
    launchScope: 'disabled',
  },
  'squad-wars': {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Squad vs squad competitions - disabled for launch',
    launchScope: 'disabled',
  },
  rivals: {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Rival system - disabled for launch',
    launchScope: 'disabled',
  },
  trading: {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Item trading system - disabled for launch',
    launchScope: 'disabled',
  },
  'emergency-gem-sinks': {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Emergency gem consumption - disabled for launch',
    launchScope: 'disabled',
  },
  'complex-crafting': {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'Complex crafting system - disabled for launch',
    launchScope: 'disabled',
  },
  'ar-experimental': {
    enabled: false,
    optional: false,
    disabled: true,
    description: 'AR features - disabled for launch',
    launchScope: 'disabled',
  },
};

// ============================================================================
// Feature Flag Helper Functions
// ============================================================================

export function isFeatureEnabled(feature: string): boolean {
  const config = FEATURE_FLAGS[feature];
  return config?.enabled ?? false;
}

export function isFeatureOptional(feature: string): boolean {
  const config = FEATURE_FLAGS[feature];
  return config?.optional ?? false;
}

export function isFeatureDisabled(feature: string): boolean {
  const config = FEATURE_FLAGS[feature];
  return config?.disabled ?? false;
}

export function getLaunchEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, config]) => config.enabled)
    .map(([feature, _]) => feature);
}

export function getOptionalFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, config]) => config.optional)
    .map(([feature, _]) => feature);
}

export function getDisabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, config]) => config.disabled)
    .map(([feature, _]) => feature);
}

// Legacy compatibility with existing code
export const FEATURE_FLAG_DEFAULTS: Record<string, boolean> = Object.fromEntries(
  Object.entries(FEATURE_FLAGS).map(([key, config]) => [key, config.enabled])
);

export const FEATURE_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
  Object.entries(FEATURE_FLAGS).map(([key, config]) => [key, config.description])
);

// Legacy feature names for backward compatibility
export const LEGACY_FEATURE_FLAGS = {
  DARK_MODE: 'dark_mode',
  BIOMETRIC_LOGIN: 'biometric_login',
  SQUAD_VOICE_CHAT: 'squad_voice_chat',
  AI_ASSISTANT: 'ai_assistant',
  BETA_FEATURES: 'beta_features',
} as const;

export const FEATURE_GROUPS = {
  core: getLaunchEnabledFeatures(),
  optional: getOptionalFeatures(),
  disabled: getDisabledFeatures(),
  ui: ['dark_mode', 'reduced_motion'],
  auth: ['biometric_login', 'social_login'],
  social: ['squads'],
  economy: ['rewards'],
  experimental: ['ar-experimental'],
} as const;