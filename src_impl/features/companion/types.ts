/**
 * Living Companion System - Core Types
 *
 * The companion is a living entity that evolves in real-time during focus sessions.
 * It provides immediate visual feedback and emotional connection during the core loop.
 */

export type CompanionPhase = 'EGG' | 'HATCHING' | 'YOUNG' | 'MATURE' | 'AWAKENED' | 'TRANSCENDENT';
export type CompanionMood = 'SLEEPY' | 'CONTENT' | 'FOCUSED' | 'DETERMINED' | 'ECSTATIC' | 'STRUGGLING' | 'DANGER';
export type CompanionElement = 'FLAME' | 'WAVE' | 'TERRA' | 'ZEPHYR' | 'VOID' | 'LUMINA';

export interface CompanionState {
  id: string;
  userId: string;

  // Evolution state
  phase: CompanionPhase;
  level: number; // 1-100 within each phase
  totalFocusMinutes: number;

  // Element affinity (chosen by user or discovered)
  element: CompanionElement;
  elementAffinity: number; // 0-100, affects visual intensity

  // Current session state (REAL-TIME)
  currentMood: CompanionMood;
  sessionProgress: number; // 0-100, percent of session complete
  purityScore: number; // 0-100, based on focus quality
  energyLevel: number; // 0-100, drains if distracted, fills when focused

  // Visual DNA - procedural generation seed
  visualSeed: number;
  colorHue: number; // 0-360
  particleDensity: number; // affects visual richness

  // Session history for this companion
  sessionCount: number;
  perfectSessions: number;
  longestFocusStreak: number; // consecutive minutes of pure focus

  // Evolution thresholds
  nextEvolutionAt: number; // minutes of focus required

  updatedAt: number;
}

export interface CompanionSessionEvent {
  type: 'GROWTH_PULSE' | 'MOOD_SHIFT' | 'MILESTONE' | 'PURE_FOCUS_BURST' | 'DANGER_WARN';
  timestamp: number;
  data: {
    progressDelta?: number;
    mood?: CompanionMood;
    message?: string;
    intensity?: number; // 0-1 for visual effect strength
  };
}

export interface CompanionVisualConfig {
  phase: CompanionPhase;
  mood: CompanionMood;
  element: CompanionElement;
  progress: number;
  energy: number;
  purity: number;
}

// Evolution requirements
export const EVOLUTION_THRESHOLDS: Record<CompanionPhase, number> = {
  EGG: 0,
  HATCHING: 60,     // 1 hour to hatch
  YOUNG: 300,       // 5 hours to mature
  MATURE: 1000,     // 16 hours to awaken
  AWAKENED: 5000,   // 83 hours to transcend
  TRANSCENDENT: Infinity,
};

// Mood transitions based on session state
export const MOOD_RULES = {
  SLEEPY: { minProgress: 0, maxProgress: 10, minEnergy: 0 },
  CONTENT: { minProgress: 10, maxProgress: 30, minEnergy: 30 },
  FOCUSED: { minProgress: 30, maxProgress: 70, minEnergy: 50, minPurity: 70 },
  DETERMINED: { minProgress: 70, maxProgress: 95, minEnergy: 60 },
  ECSTATIC: { minProgress: 95, minEnergy: 80, minPurity: 90 },
  STRUGGLING: { maxEnergy: 30 },
  DANGER: { maxPurity: 30, maxEnergy: 20 },
} as const;

// Element visual themes
export const ELEMENT_THEMES: Record<CompanionElement, {
  primary: string;
  secondary: string;
  glow: string;
  particle: string;
  ambience: string;
}> = {
  FLAME: {
    primary: 'theme.colors.error.DEFAULT',
    secondary: 'theme.colors.primary[500]',
    glow: 'theme.colors.error.DEFAULT',
    particle: 'theme.colors.error.DEFAULT',
    ambience: 'warm',
  },
  WAVE: {
    primary: 'theme.colors.primary[500]',
    secondary: 'theme.colors.primary[500]',
    glow: 'theme.colors.primary[500]',
    particle: 'theme.colors.primary[500]',
    ambience: 'cool',
  },
  TERRA: {
    primary: 'theme.colors.primary[500]',
    secondary: 'theme.colors.primary[500]',
    glow: 'theme.colors.primary[500]',
    particle: 'theme.colors.primary[500]',
    ambience: 'earthy',
  },
  ZEPHYR: {
    primary: 'theme.colors.primary[500]',
    secondary: 'theme.colors.primary[500]',
    glow: 'theme.colors.background.primary',
    particle: 'theme.colors.primary[500]',
    ambience: 'ethereal',
  },
  VOID: {
    primary: 'theme.colors.primary[500]',
    secondary: 'theme.colors.primary[500]',
    glow: 'theme.colors.primary[500]',
    particle: 'theme.colors.primary[500]',
    ambience: 'mysterious',
  },
  LUMINA: {
    primary: 'theme.colors.error.DEFAULT',
    secondary: 'theme.colors.error.DEFAULT',
    glow: 'theme.colors.error.DEFAULT',
    particle: 'theme.colors.background.primary',
    ambience: 'divine',
  },
};
