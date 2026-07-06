/**
 * First Week Pacing Configuration
 *
 * Defines the first 7-session progression arc with proper pacing.
 */

import {
  type FirstWeekConfig,
} from './schemas';

export { getNextSession, getSessionNumber } from './helpers';

export const FIRST_WEEK_CONFIG: FirstWeekConfig = {
  sessionUnlocks: {
    COMPLETED: [],
    SESSION_1: [
      {
        session: 'SESSION_1',
        unlockType: 'FEATURE',
        title: 'Focus Score Active',
        description:
          'Your Focus Score now changes based on session quality and consistency.',
        actionRequired: false,
        icon: '📊',
        priority: 1,
      },
    ],
    SESSION_2: [
      {
        session: 'SESSION_2',
        unlockType: 'TUTORIAL',
        title: 'Your Rhythm Explained',
        description: 'See how your daily rhythm builds consistency over time.',
        actionRequired: true,
        actionText: 'View rhythm',
        icon: '🔄',
        priority: 1,
      },
    ],
    SESSION_3: [
      {
        session: 'SESSION_3',
        unlockType: 'REWARD',
        title: 'Companion Awakens',
        description:
          'Your companion arrives, reflecting your first three focus sessions.',
        actionRequired: false,
        icon: '✨',
        priority: 1,
      },
      {
        session: 'SESSION_3',
        unlockType: 'FEATURE',
        title: 'Progress Proof',
        description: 'Minutes focused, streak alive, and growth visible.',
        actionRequired: false,
        icon: '📈',
        priority: 2,
      },
    ],
    SESSION_4: [
      {
        session: 'SESSION_4',
        unlockType: 'FEATURE',
        title: 'Smarter Sessions',
        description:
          'VEX now recommends sessions based on your actual patterns.',
        actionRequired: false,
        icon: '💡',
        priority: 1,
      },
    ],
    SESSION_5: [
      {
        session: 'SESSION_5',
        unlockType: 'INSIGHT',
        title: 'AI Coach Insight',
        description:
          'Your coach analyzes your focus patterns and shares a personal insight.',
        actionRequired: false,
        icon: '🧠',
        priority: 1,
      },
    ],
    SESSION_6: [
      {
        session: 'SESSION_6',
        unlockType: 'FEATURE',
        title: 'First Simple Challenge',
        description:
          'A small target based on your own history. Just your next step.',
        actionRequired: false,
        icon: '🎯',
        priority: 1,
      },
    ],
    SESSION_7: [
      {
        session: 'SESSION_7',
        unlockType: 'REWARD',
        title: 'First Week Complete',
        description: 'You finished your first week. Choose your path forward.',
        actionRequired: true,
        actionText: 'Choose path',
        icon: '🏆',
        priority: 1,
      },
    ],
  },
  xpRewards: {
    COMPLETED: 0,
    SESSION_1: 50, // Small amount to show progress
    SESSION_2: 75, // Slightly more for streak tutorial
    SESSION_3: 100, // First meaningful reward
    SESSION_4: 125, // Consistent progression
    SESSION_5: 150, // AI coach unlock
    SESSION_6: 175, // Advanced features
    SESSION_7: 250, // Weekly milestone bonus
  },
  companionReactions: {
    COMPLETED: 'Your focus journey begins. One session down.',
    SESSION_1: 'Your focus journey begins. One session down.',
    SESSION_2: 'Your rhythm is taking shape. Two sessions prove consistency.',
    SESSION_3: 'Your companion awakens! It reflects your first three sessions.',
    SESSION_4: 'Your companion learns your focus patterns.',
    SESSION_5: 'Your companion sees real dedication forming.',
    SESSION_6: 'Your companion helps you understand your journey better.',
    SESSION_7: 'Your companion celebrates your first full week of focus!',
  },
  tutorialSteps: {
    COMPLETED: [],
    SESSION_1: [
      'Start your first focus session',
      'Notice how your Focus Score changes',
      'One session is all that matters today',
    ],
    SESSION_2: [
      'Complete your second session',
      'Learn how your rhythm builds',
      'Understand the daily anchor concept',
    ],
    SESSION_3: [
      'Focus with quality',
      'Meet your companion',
      'See proof of your consistency',
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
      'Try your first challenge',
      'Push just slightly beyond comfort',
      'See how small pushes compound',
    ],
    SESSION_7: [
      'Complete your 7th session',
      'Review your first week journey',
      'Choose your path forward',
    ],
  },
  COMPLETED: {
    sessionUnlocks: [],
    xpRewards: 0,
    companionReactions: 'All first-week sessions complete. Your path forward is yours to choose.',
    tutorialSteps: [],
  },
} as FirstWeekConfig;
