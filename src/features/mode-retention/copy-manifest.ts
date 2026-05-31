import type { Lane } from '../lane-engine/types';
import type { ModeRetentionManifest } from './schemas';

export const MODE_RETENTION_MANIFEST: Record<Lane, ModeRetentionManifest> = {
  student: {
    lane: 'student',
    returnReason: 'VEX knows what I need to study or review next.',
    hookCopy: 'Your next study block is ready.',
    day1Copy: 'Continue with one review block.',
    day3Memory:
      'VEX noticed your study blocks work better when the target is named first.',
    day7Intelligence:
      'This week, your strongest study rhythm was shorter named blocks.',
    rescueCopy: {
      headline: 'Review one weak section for 8 minutes',
      body: 'Just open your notes. One section. No quiz, no pressure.',
      sessionMinutes: 8,
      actionLabel: 'Start review',
    },
    notificationCopy: {
      title: 'Your next review block is small',
      body: '10 minutes. One topic VEX flagged for review.',
      maxPerDay: 1,
    },
    premiumBridge: {
      headline: 'Go deeper with Study Intelligence',
      featureList: 'weak topics, review planning, and exam prep.',
    },
  },
  game_like: {
    lane: 'game_like',
    returnReason: 'VEX helps me build momentum and understand what blocks me.',
    hookCopy: 'Your next clean run is ready.',
    day1Copy: 'Start one clean run before friction stacks.',
    day3Memory:
      'VEX noticed your strongest runs start with a named target.',
    day7Intelligence:
      'Your biggest blocker this week was opening the app without starting.',
    rescueCopy: {
      headline: 'Recovery run: 10 clean minutes',
      body: 'No blockers. No targets. Just 10 minutes of clean focus.',
      sessionMinutes: 10,
      actionLabel: 'Start recovery',
    },
    notificationCopy: {
      title: 'Your next clean run is ready',
      body: '15 minutes. Name the target and start.',
      maxPerDay: 1,
    },
    premiumBridge: {
      headline: 'Unlock advanced Run Intelligence',
      featureList: 'blocker patterns, custom modifiers, and weekly run recaps.',
    },
  },
  deep_creative: {
    lane: 'deep_creative',
    returnReason: 'VEX remembers where I left off.',
    hookCopy: 'Your project is waiting at the next move.',
    day1Copy: 'Continue from the next move you saved.',
    day3Memory:
      'VEX noticed your project thread gets easier to resume when the next move is specific.',
    day7Intelligence:
      'Your project stayed active when you saved a handoff after each block.',
    rescueCopy: {
      headline: 'Re-enter the project and find the next move',
      body: "Just open the project. Find one next move. That's all.",
      sessionMinutes: 7,
      actionLabel: 'Re-enter',
    },
    notificationCopy: {
      title: 'Your project thread is waiting at the next move',
      body: 'One concrete step. Ready when you are.',
      maxPerDay: 1,
    },
    premiumBridge: {
      headline: 'Unlock Project Memory',
      featureList: 'context restore, next moves, and flow windows.',
    },
  },
  minimal_normal: {
    lane: 'minimal_normal',
    returnReason: 'VEX gives me one useful action without noise.',
    hookCopy: 'One clean action is ready.',
    day1Copy: 'One clean block is enough today.',
    day3Memory:
      'VEX noticed you prefer fewer prompts and one clear action.',
    day7Intelligence:
      'Your cleanest sessions happened when VEX stayed quiet.',
    rescueCopy: {
      headline: 'Do 5 minutes. Stop cleanly.',
      body: "One action. Five minutes. That's a win.",
      sessionMinutes: 5,
      actionLabel: 'Start',
    },
    notificationCopy: {
      title: 'One clean block is enough today',
      body: '15 minutes. One action. Done.',
      maxPerDay: 1,
    },
    premiumBridge: {
      headline: 'Unlock Focus Intelligence',
      featureList: 'quiet weekly reports, best windows, and smarter planning.',
    },
  },
};
