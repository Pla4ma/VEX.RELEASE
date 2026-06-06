import type {
  MessageCategory,
  CoachMessageTemplate,
} from '../schemas';

// ─── Configuration ───

export interface GenerationConfig {
  maxTemplateAttempts: number;
  variableValidationEnabled: boolean;
  contentSanitizationEnabled: boolean;
  maxContentLength: number;
  minContentLength: number;
}

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  maxTemplateAttempts: 3,
  variableValidationEnabled: true,
  contentSanitizationEnabled: true,
  maxContentLength: 1000,
  minContentLength: 10,
};

// ─── Template Library ───

export interface TemplateLibrary {
  templates: Map<MessageCategory, CoachMessageTemplate[]>;
  lastUpdated: number;
  version: string;
}

// ─── Validation ───

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Default Templates ───

export const DEFAULT_TEMPLATES: Record<MessageCategory, string[]> = {
  STREAK_RISK: [
    '🔥 Your {{currentStreak}}-day streak is at risk! {{hoursRemaining}} hours left to save it with a quick {{suggestedDuration}}-minute session.',
    "Don't let your streak slip! ⚡ Just {{suggestedDuration}} minutes today keeps your {{currentStreak}}-day streak alive.",
    "Streak emergency! 🚨 {{hoursRemaining}} hours remaining. One short session saves everything you've built!",
  ],
  SESSION_SUGGESTION: [
    '🎯 Perfect time for focus! Based on your patterns, a {{suggestedDuration}}-minute {{difficulty}} session would be ideal right now.',
    "Your optimal focus window is open! You've crushed {{similarPastSessions}} sessions like this before.",
    'Ready to build momentum? {{encouragement}} A quick {{suggestedDuration}}-minute session fits perfectly in your schedule.',
  ],
  MILESTONE_HYPE: [
    "🎉 INCREDIBLE! {{milestoneDays}} days of pure dedication! You're in the top {{percentile}}% of focused performers!",
    'LEGENDARY STATUS! 🔥 {{milestoneDays}} days strong! Your consistency is absolutely inspiring!',
    'MILESTONE CRUSHED! 🏆 {{milestoneDays}} days proves your unstoppable commitment to growth!',
  ],
  COMEBACK_SUPPORT: [
    '💪 Welcome back! Every master was once a beginner who returned. Your comeback starts now with {{bonusMultiplier}}x XP!',
    "The streak may have paused, but your journey continues! 🌱 Day {{comebackDay}} of your comeback - you've got this!",
    "Stronger than before! 🔥 Your previous {{previousStreak}}-day streak shows you have what it takes. Let's rebuild!",
  ],
  POST_FAILURE: [
    "That session was tough, but here's what matters: you showed up. 🌱 Growth happens in challenges.",
    'Every expert faced setbacks. Yours just made you more resilient. 💪 Ready when you are!',
    'Focus is a skill, and skills develop through practice - including the challenging sessions. 🎯',
  ],
  PROGRESS_REMINDER: [
    "You're {{percentToNextLevel}}% to Level {{nextLevel}}! 🎯 One more quality session could push you over the edge!",
    'Your progress is adding up beautifully! {{totalXp}} XP earned. Keep this momentum! 📈',
    "Level {{currentLevel}} looks great on you! Ready to unlock Level {{nextLevel}}? You're closer than you think!",
  ],
  DIFFICULTY_ADJUST: [
    "Noticing your recent sessions? 🧠 Let's {{adjustmentDirection}} the challenge to match your current flow state.",
    'Smart adaptation is key to growth. Your patterns suggest a {{adjustmentDirection}} would optimize your focus.',
    "You've been {{performanceTrend}}. A difficulty {{adjustmentDirection}} might be exactly what you need right now.",
  ],
  CHALLENGE_PROMPT: [
    "🎮 Challenge alert! {{challengeName}} expires in {{hoursLeft}} hours. You're {{progressPercent}}% there - finish strong!",
    "Don't leave rewards on the table! {{challengeProgress}}% done - one focused session could complete it! 💎",
    "Your challenge is calling! 📢 {{hoursLeft}} hours left. You've got the skills - time to use them!",
  ],
  MOTIVATION_BOOST: [
    "You're capable of incredible focus. Today's session is tomorrow's achievement. ✨ Believe in your progress!",
    "Small steps compound into extraordinary results. Every session you're building something great! 📈",
    'Your future self is watching and thanking you for showing up today. 🙏 Keep building those habits!',
  ],
  BREAK_SUGGESTION: [
    "You've been crushing it! 🧘 Your focus quality may benefit from a short reset. Step away, breathe, return stronger.",
    'Quality over quantity champion! A mindful break now means sharper focus when you return. 🌊',
    "Your brain has been working hard. Give it 5 minutes of rest - you'll come back even stronger! 💪",
  ],
  OVERLOAD_WARNING: [
    "Whoa, that's {{sessionCount}} sessions today! 🔥 Impressive dedication, but remember: sustainable progress beats burnout.",
    "You're pushing hard today! 🎯 Consider pacing - your best work comes from consistent energy, not depletion.",
    'Amazing commitment, but your focus quality may drop. 🌊 Balance intensity with recovery for long-term growth.',
  ],
};

// ─── Safe Defaults ───

export function getSafeDefault(category: MessageCategory): string {
  const safeDefaults: Record<MessageCategory, string> = {
    STREAK_RISK: '🔥 Your streak is at risk! Quick session needed to save it.',
    SESSION_SUGGESTION: '🎯 Perfect time for a focus session!',
    MILESTONE_HYPE: '🎉 Amazing progress! Keep it up!',
    COMEBACK_SUPPORT: "💪 You're doing great! Every session counts.",
    POST_FAILURE: "That was tough, but you showed up. That's what matters!",
    PROGRESS_REMINDER: "You're making great progress! Keep going!",
    DIFFICULTY_ADJUST: "Let's adjust to find your optimal challenge level.",
    CHALLENGE_PROMPT: "🎮 Don't miss out on that challenge reward!",
    MOTIVATION_BOOST: "You've got this! Believe in your progress!",
    BREAK_SUGGESTION: "🧘 Take a moment to recharge. You've earned it!",
    OVERLOAD_WARNING:
      '🔥 Impressive dedication! Consider pacing for sustainability.',
  };
  return safeDefaults[category] || 'Keep up the great work!';
}
