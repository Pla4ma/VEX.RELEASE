
/**
 * Living Companion System - Core Types
 *
 * The companion is a living entity that evolves in real-time during focus sessions.
 * It provides immediate visual feedback and emotional connection during the core loop.
 *
 * Colors below are documented game-mechanic color data — not UI styling.
 * These map to theme tokens where possible: theme.colors.accent.*, theme.colors.semantic.*
 */

export type CompanionPhase =
  | 'EGG'
  | 'HATCHING'
  | 'YOUNG'
  | 'MATURE'
  | 'AWAKENED'
  | 'TRANSCENDENT';
export type CompanionMood =
  | 'SLEEPY'
  | 'CONTENT'
  | 'FOCUSED'
  | 'DETERMINED'
  | 'ECSTATIC'
  | 'STRUGGLING'
  | 'DANGER';
export type CompanionElement =
  | 'FLAME'
  | 'WAVE'
  | 'TERRA'
  | 'ZEPHYR'
  | 'VOID'
  | 'LUMINA';

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
  type:
    | 'GROWTH_PULSE'
    | 'MOOD_SHIFT'
    | 'MILESTONE'
    | 'PURE_FOCUS_BURST'
    | 'DANGER_WARN';
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
  HATCHING: 60, // 1 hour to hatch
  YOUNG: 300, // 5 hours to mature
  MATURE: 1000, // 16 hours to awaken
  AWAKENED: 5000, // 83 hours to transcend
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
export const ELEMENT_THEMES: Record<
  CompanionElement,
  {
    primary: string;
    secondary: string;
    glow: string;
    particle: string;
    ambience: string;
  }
> = {
  FLAME: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    glow: '#ff4500',
    particle: '#ffd700',
    ambience: 'warm',
  },
  WAVE: {
    primary: '#4ecdc4',
    secondary: '#44a08d',
    glow: '#00ced1',
    particle: '#87ceeb',
    ambience: 'cool',
  },
  TERRA: {
    primary: '#8b4513',
    secondary: '#228b22',
    glow: '#9acd32',
    particle: '#deb887',
    ambience: 'earthy',
  },
  ZEPHYR: {
    primary: '#e0e0e0',
    secondary: '#b0c4de',
    glow: '#ffffff',
    particle: '#f0f8ff',
    ambience: 'ethereal',
  },
  VOID: {
    primary: '#2c003e',
    secondary: '#4b0082',
    glow: '#9400d3',
    particle: '#e6e6fa',
    ambience: 'mysterious',
  },
  LUMINA: {
    primary: '#ffd700',
    secondary: '#ffa500',
    glow: '#fffacd',
    particle: '#ffffff',
    ambience: 'divine',
  },
};
