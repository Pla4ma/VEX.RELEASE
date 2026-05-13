

export const USER_PROMPT_TEMPLATES = {
  COACH_MESSAGE: `Generate a coach message with the following context:

Category: {{category}}
Persona Style: {{personaStyle}}
Current Streak: {{currentStreak}} days
Hours Since Last Session: {{hoursSinceLastSession}}
Current Level: {{currentLevel}}
Recent Session Quality: {{recentSessionQuality}}/100

Output only the message content, no explanations.`,

  SESSION_SUMMARY: `Generate a session summary for this user:

Period: {{period}}
Sessions Completed: {{sessionCount}}
Total Focus Hours: {{totalFocusHours}}
Average Quality: {{averageQuality}}/100
Streak at Start: {{streakAtStart}} days
Streak at End: {{streakAtEnd}} days
XP Earned: {{xpEarned}}
Challenges Completed: {{challengesCompleted}}
{{#bossEncounters}}Boss Encounters: {{bossEncounters}}{{/bossEncounters}}

Generate a motivating summary with specific highlights.`,

  COMEBACK_PROMPT: `Generate a comeback prompt for day {{comebackDay}} of 3:

Previous Streak: {{previousStreak}} days
Days Inactive: {{daysInactive}}
Sessions Completed in Comeback: {{sessionsCompleted}}
Bonus Multiplier: {{bonusMultiplier}}x
Persona Style: {{personaStyle}}

Create encouraging, progress-focused message.`,

  STREAK_RISK_NUDGE: `Generate urgent streak risk nudge:

Current Streak: {{currentStreak}} days 🔥
Hours Remaining: {{hoursRemaining}}
Risk Level: {{riskLevel}}
Last Session Quality: {{lastSessionQuality}}/100

Generate one urgent, motivating sentence to save the streak.`,

  WEEKLY_REFLECTION: `Generate weekly reflection for week {{weekNumber}}:

Sessions: {{sessionsCompleted}}
Focus Hours: {{totalFocusHours}}
Avg Quality: {{averageQuality}}/100
Streak Change: {{streakAtStart}} → {{streakAtEnd}}
XP Earned: {{xpEarned}}
Level Ups: {{levelUps}}
Challenges: {{challengesCompleted}}
Bosses: {{bossEncounters}}
{{#improvementAreas}}Areas to Improve: {{improvementAreas}}{{/improvementAreas}}
{{#strengths}}Strengths: {{strengths}}{{/strengths}}

Generate structured weekly reflection.`,
} as const;

export const FALLBACK_CONTENT = {
  COACH_MESSAGE: {
    STREAK_RISK: [
      '🔥 Your streak is at risk! Just 15 minutes today keeps it alive.',
      'Your streak needs you! Quick focus session to save the day?',
      "Don't let your hard work slip away! One session saves it all.",
    ],
    SESSION_SUGGESTION: [
      "Perfect time for focus! You're in the zone today.",
      'Ready to build momentum? A quick session would be perfect now.',
      'Your focus window is open! Make the most of it.',
    ],
    MILESTONE_HYPE: [
      '🎉 Incredible dedication! Keep the momentum going!',
      "You're on fire! Every session compounds into greatness.",
      'Epic streak! Your consistency is inspiring!',
    ],
    COMEBACK_SUPPORT: [
      '💪 Every comeback is stronger than the break. You have got this!',
      'Fresh start, stronger you! The streak starts now.',
      'Past is practice. Today is progress. Keep going!',
    ],
    POST_FAILURE: [
      "That one didn't go as planned. That is okay - growth comes from challenges!",
      'Every expert was once a beginner who kept trying.',
      "Focus is a skill. Today's difficulty is tomorrow's strength.",
    ],
    PROGRESS_REMINDER: [
      'Building momentum! Every session brings you closer to your goals.',
      "Progress isn't always visible, but it's always happening.",
      "You're leveling up! Keep showing up for yourself.",
    ],
    MOTIVATION_BOOST: [
      "You're capable of amazing things. Today's focus is tomorrow's achievement!",
      'Small steps, big results. Every session compounds!',
      'Your future self will thank you for showing up today.',
    ],
    BREAK_SUGGESTION: [
      'You have been crushing it! A short break will recharge you.',
      'Quality over quantity. Rest now, focus sharper later.',
      'Your brain deserves a reset. Step away and come back stronger.',
    ],
  },

  SESSION_SUMMARY: {
    daily: [
      'Great work today! Every session is a step forward. Keep building that momentum!',
    ],
    weekly: [
      'What a week! Your dedication is paying off. Ready to make next week even better?',
    ],
    monthly: [
      'A month of progress! Look how far you have come. Your consistency is incredible!',
    ],
  },

  COMEBACK_PROMPT: {
    day1: '💪 Welcome back! Day 1 of your comeback starts now. First session gets 2x XP!',
    day2: '🔥 Day 2! You are rebuilding stronger than before. Keep that momentum!',
    day3: '🎉 Comeback complete! You have earned your 2x bonus. Your streak is back!',
  },

  STREAK_RISK_NUDGE: {
    critical: '🔥 CRITICAL: Your streak expires soon! Start a 15-min session NOW!',
    high: '⏰ Your streak is at risk! One quick session saves it!',
    medium: '⚠️ Streak warning! Do not let your progress slip away.',
    low: 'Heads up: Your streak window is closing. Ready for a session?',
  },

  WEEKLY_REFLECTION: {
    default: `## Week at a Glance
You showed up this week and put in the work. That consistency is what builds lasting habits.

## Wins
- You maintained your focus practice
- Progress was made, session by session
- Your dedication is building momentum

## Reflection
Every expert was once a beginner who kept showing up. You are on that path.

## Next Week Focus
Keep the rhythm going. One session at a time.`,
  },
} as const;

export const VALIDATION_RULES = {
  COACH_MESSAGE: {
    minLength: 10,
    maxLength: 1000,
    requiredKeywords: [],
    forbiddenPatterns: [
      /i am an ai/i,
      /as an ai/i,
      /i am just/i,
      /i cannot/i,
      /i do not have/i,
    ],
  },
  SESSION_SUMMARY: {
    minLength: 50,
    maxLength: 2000,
    requiredSections: ['headline', 'reflection'],
  },
  COMEBACK_PROMPT: {
    minLength: 20,
    maxLength: 500,
    requiredKeywords: ['comeback', 'streak'],
  },
  STREAK_RISK_NUDGE: {
    minLength: 10,
    maxLength: 300,
    requiredKeywords: ['streak', 'session'],
    requiredEmoji: ['🔥'],
  },
  WEEKLY_REFLECTION: {
    minLength: 100,
    maxLength: 3000,
    requiredSections: ['week', 'wins', 'reflection', 'focus'],
  },
} as const;