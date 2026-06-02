

export const FOCUS_SCORE_CONFIG = {
  MIN_SCORE: 300,
  MAX_SCORE: 850,
  INITIAL_SCORE: 550,
  BANDS: [
    {
      min: 800,
      max: 850,
      label: 'Legendary',
      title: 'Focus Virtuoso',
      color: '#ffd700',
      percentile: 99,
    },
    {
      min: 740,
      max: 799,
      label: 'Elite',
      title: 'Elite Performer',
      color: '#c0c0c0',
      percentile: 95,
    },
    {
      min: 670,
      max: 739,
      label: 'Exceptional',
      title: 'Exceptional Focus',
      color: '#cd7f32',
      percentile: 85,
    },
    {
      min: 580,
      max: 669,
      label: 'Strong',
      title: 'Strong Focus',
      color: '#4caf50',
      percentile: 70,
    },
    {
      min: 500,
      max: 579,
      label: 'Good',
      title: 'Good Focus',
      color: '#8bc34a',
      percentile: 50,
    },
    {
      min: 420,
      max: 499,
      label: 'Fair',
      title: 'Developing Focus',
      color: '#ffc107',
      percentile: 30,
    },
    {
      min: 300,
      max: 419,
      label: 'Building',
      title: 'Building Habits',
      color: '#ff9800',
      percentile: 10,
    },
  ] as const,
  FACTOR_WEIGHTS: {
    CONSISTENCY: 0.35,
    STREAK_STABILITY: 0.3,
    SESSION_QUALITY: 0.15,
    DIVERSITY: 0.1,
    RECENCY: 0.1,
  },
  SCORE_CHANGES: {
    SESSION_COMPLETE: { base: 5, max: 25 },
    STREAK_MILESTONE: { base: 20, max: 50 },
    MISSED_DAY: { base: -15, max: -35 },
    STREAK_BREAK: { base: -30, max: -80 },
    SESSION_ABANDON: { base: -25, max: -50 },
    PERFECT_SESSION: { base: 31, max: 50 },
  },
  RECOVERY_WINDOW_DAYS: 90,
  RECOVERY_BONUS_MULTIPLIER: 1.5,
} as const;

export const IDENTITY_STATEMENTS: Record<
  (typeof FOCUS_SCORE_CONFIG.BANDS)[number]['label'],
  string[]
> = {
  Legendary: [
    'You are a Focus Virtuoso. Your discipline inspires others.',
    "Focus isn't just what you do—it's who you are.",
    "You're in the top 1%. Your commitment is legendary.",
  ],
  Elite: [
    'You are an Elite Performer. Excellence is your standard.',
    'Your focus habits are exceptional. Keep raising the bar.',
    "You're among the most disciplined people using this app.",
  ],
  Exceptional: [
    "You have Exceptional Focus. You're building something great.",
    "Your consistency is paying off. You're becoming unstoppable.",
    "You're in the top 15%. Your dedication shows.",
  ],
  Strong: [
    "You have Strong Focus. You're developing powerful habits.",
    "You're becoming the kind of person who follows through.",
    'Your momentum is building. Stay consistent.',
  ],
  Good: [
    "You have Good Focus. You're on the right path.",
    "You're building the habits that will change your life.",
    "Keep showing up. You're becoming more focused every day.",
  ],
  Fair: [
    "You're Developing Focus. Every session makes you stronger.",
    "Progress, not perfection. You're learning to be consistent.",
    'Your potential is there. Keep building the habit.',
  ],
  Building: [
    "You're Building Habits. Small steps lead to big changes.",
    'Everyone starts somewhere. Your journey is just beginning.',
    "Focus is a muscle. You're getting stronger with each session.",
  ],
};
