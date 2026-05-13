import { FirstWeekConfigSchema, type FirstWeekConfig, type FirstWeekSession } from "./schemas";


export const FIRST_WEEK_CONFIG: FirstWeekConfig = {
  sessionUnlocks: {
    SESSION_1: [
      {
        session: 'SESSION_1',
        unlockType: 'FEATURE',
        title: 'Focus Score Movement',
        description: 'Your Focus Score changes based on session quality and consistency.',
        actionRequired: false,
        icon: '📊',
        priority: 1,
      },
      {
        session: 'SESSION_1',
        unlockType: 'FEATURE',
        title: 'Companion Reaction',
        description: 'Your companion responds to your focus and grows with you.',
        actionRequired: false,
        icon: '🐾',
        priority: 2,
      },
    ],
    SESSION_2: [
      {
        session: 'SESSION_2',
        unlockType: 'TUTORIAL',
        title: 'Streak System',
        description: 'Learn how streaks work and why consistency matters.',
        actionRequired: true,
        actionText: 'View Streak Tutorial',
        icon: '🔥',
        priority: 1,
      },
    ],
    SESSION_3: [
      {
        session: 'SESSION_3',
        unlockType: 'REWARD',
        title: 'First Meaningful Reward',
        description: 'Earn your first XP milestone and unlock achievements.',
        actionRequired: false,
        icon: '🏆',
        priority: 1,
      },
    ],
    SESSION_4: [
      {
        session: 'SESSION_4',
        unlockType: 'FEATURE',
        title: 'Session Recommendations',
        description: 'Get personalized session recommendations based on your progress.',
        actionRequired: false,
        icon: '💡',
        priority: 1,
      },
    ],
    SESSION_5: [
      {
        session: 'SESSION_5',
        unlockType: 'INSIGHT',
        title: 'AI Coach Pattern Insight',
        description: 'Your AI coach analyzes your patterns and provides insights.',
        actionRequired: false,
        icon: '🤖',
        priority: 1,
      },
    ],
    SESSION_6: [
      {
        session: 'SESSION_6',
        unlockType: 'FEATURE',
        title: 'Advanced Progress Tracking',
        description: 'See detailed analytics about your focus patterns.',
        actionRequired: false,
        icon: '📈',
        priority: 1,
      },
    ],
    SESSION_7: [
      {
        session: 'SESSION_7',
        unlockType: 'REWARD',
        title: 'Weekly Milestone',
        description: 'Complete your first week and earn special rewards.',
        actionRequired: false,
        icon: '🎯',
        priority: 1,
      },
    ],
  },
  xpRewards: {
    SESSION_1: 50,  // Small amount to show progress
    SESSION_2: 75,  // Slightly more for streak tutorial
    SESSION_3: 100, // First meaningful reward
    SESSION_4: 125, // Consistent progression
    SESSION_5: 150, // AI coach unlock
    SESSION_6: 175, // Advanced features
    SESSION_7: 250, // Weekly milestone bonus
  },
  companionReactions: {
    SESSION_1: 'Your companion awakens and feels your first focus session!',
    SESSION_2: 'Your companion notices your growing consistency.',
    SESSION_3: 'Your companion celebrates your first real achievement!',
    SESSION_4: 'Your companion learns your patterns and preferences.',
    SESSION_5: 'Your companion is impressed by your dedication.',
    SESSION_6: 'Your companion helps you understand your journey better.',
    SESSION_7: 'Your companion celebrates your successful first week!',
  },
  tutorialSteps: {
    SESSION_1: [
      'Start your first focus session',
      'Notice how your Focus Score changes',
      'Watch your companion react to your focus',
    ],
    SESSION_2: [
      'Complete your second session',
      'Learn about streak requirements',
      'Understand the 24-hour window',
    ],
    SESSION_3: [
      'Focus on session quality',
      'Earn your first XP milestone',
      'See your companion grow',
    ],
    SESSION_4: [
      'Try the recommended session',
      'Notice personalized suggestions',
      'Adjust based on feedback',
    ],
    SESSION_5: [
      'Complete a session with good focus',
      'Read your AI coach insight',
      'Apply the recommendation',
    ],
    SESSION_6: [
      'Focus on consistency',
      'Review your weekly patterns',
      'Plan your next sessions',
    ],
    SESSION_7: [
      'Complete your 7th session',
      'Celebrate your achievement',
      'Plan your continued journey',
    ],
  },
} as const satisfies FirstWeekConfig;

export function getNextSession(currentSession: FirstWeekSession): FirstWeekSession | null {
  const sessions: FirstWeekSession[] = [
    'SESSION_1',
    'SESSION_2',
    'SESSION_3',
    'SESSION_4',
    'SESSION_5',
    'SESSION_6',
    'SESSION_7',
    'COMPLETED',
  ];

  const currentIndex = sessions.indexOf(currentSession);
  if (currentIndex === -1 || currentIndex >= sessions.length - 1) {
    return null;
  }

  return sessions[currentIndex + 1];
}