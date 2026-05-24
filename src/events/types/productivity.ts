/**
 * Productivity Event Definitions
 *
 * Real productivity events replacing fantasy game events.
 */

export interface ProductivityEventDefinitions {
  // Goal Events
  'goal:created': {
    goalId: string;
    userId: string;
    category: string;
    impact: string;
  };
  'goal:progress_updated': {
    goalId: string;
    userId: string;
    oldProgress: number;
    newProgress: number;
    realOutcome?: string;
  };
  'goal:completed': {
    goalId: string;
    userId: string;
    title: string;
    category: string;
    impactScore: number;
    investmentMinutes: number;
    actualOutcomes: string[];
  };
  'goal:paused': {
    goalId: string;
    userId: string;
    reason?: string;
  };
  'goal:resumed': {
    goalId: string;
    userId: string;
  };

  // Micro-commitment Events
  'commitment:created': {
    commitmentId: string;
    goalId: string;
    difficulty: string;
    estimatedMinutes: number;
  };
  'commitment:started': {
    commitmentId: string;
    goalId: string;
    startedAt: number;
  };
  'commitment:completed': {
    commitmentId: string;
    goalId: string;
    actualMinutes: number;
    realOutcome: string;
    quality: string;
  };
  'commitment:skipped': {
    commitmentId: string;
    goalId: string;
    reason: string;
  };

  // Focus Session Events
  'focus:started': {
    sessionId: string;
    goalId?: string;
    commitmentId?: string;
    plannedMinutes: number;
  };
  'focus:ended': {
    sessionId: string;
    actualMinutes: number;
    quality: string;
    realAccomplishments: string[];
  };
  'focus:paused': {
    sessionId: string;
    pausedAt: number;
  };
  'focus:resumed': {
    sessionId: string;
    resumedAt: number;
  };
  'focus:distraction': {
    sessionId: string;
    distractionType: string;
    timestamp: number;
  };

  // Habit Formation Events
  'habit:created': {
    habitId: string;
    category: string;
    cue: string;
  };
  'habit:completed': {
    habitId: string;
    streak: number;
    strength: number;
    realOutcome?: string;
  };
  'habit:missed': {
    habitId: string;
    missedDate: number;
    reason?: string;
  };
  'habit:strength_updated': {
    habitId: string;
    oldStrength: number;
    newStrength: number;
  };

  // Real Achievement Events
  'achievement:real_celebration': {
    type: string;
    goalTitle: string;
    impactScore: number;
    realOutcomes: string[];
    investmentMinutes: number;
  };
  'achievement:milestone_reached': {
    milestoneType: string;
    value: number;
    context: string;
  };
  'achievement:personal_best': {
    category: string;
    previousBest: number;
    newBest: number;
  };

  // Progress Analytics Events
  'productivity:insights': {
    period: string;
    insights: {
      totalFocusMinutes: number;
      goalsCompleted: number;
      habitStrength: number;
      efficiency: number;
    };
  };
  'productivity:pattern_detected': {
    patternType: string;
    description: string;
    confidence: number;
    recommendations: string[];
  };

  // Motivation Events
  'motivation:flow_state': {
    sessionId: string;
    intensity: number;
    duration: number;
    triggers: string[];
  };
  'motivation:burnout_warning': {
    severity: string;
    indicators: string[];
    recommendations: string[];
  };
  'motivation:breakthrough': {
    area: string;
    description: string;
    impact: string;
  };
}
