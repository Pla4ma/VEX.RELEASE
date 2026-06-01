import type { JourneyDayCopy } from '../schemas';

export const DAY1_COPY: JourneyDayCopy = {
  homeMessage: {
    student: 'Continue with one review block.',
    game_like: 'Start one clean run before friction stacks.',
    deep_creative: 'Continue from the next move you saved.',
    minimal_normal: 'One clean block is enough today.',
  },
  primaryCta: {
    student: 'Start 15-min study block',
    game_like: 'Start 15-min run',
    deep_creative: 'Continue project thread',
    minimal_normal: 'Start 10-min block',
  },
  sessionSuggestion: {
    student: {
      durationMinutes: 15,
      type: 'STUDY',
      taskPrompt: "One review block. Pick up where yesterday's study left off.",
    },
    game_like: {
      durationMinutes: 15,
      type: 'SPRINT',
      taskPrompt: 'One clean run. Name the target first, then move.',
    },
    deep_creative: {
      durationMinutes: 20,
      type: 'DEEP_WORK',
      taskPrompt: 'Re-enter your project. Continue from the next move you saved.',
    },
    minimal_normal: {
      durationMinutes: 10,
      type: 'LIGHT_FOCUS',
      taskPrompt: 'One short block. Same action or new — whatever feels right.',
    },
  },
  completionPayoff: {
    student: 'Rhythm starting. Two days of study, review continuity building.',
    game_like: 'Momentum building. Two clean runs, friction avoided.',
    deep_creative: 'Continuity building. You returned to the project thread.',
    minimal_normal: 'Two clean blocks. VEX is learning your pace without noise.',
  },
  nextActionCopy: {
    student: "Tomorrow VEX will show what you've built in study",
    game_like: 'Tomorrow VEX will show your momentum pattern',
    deep_creative: 'Tomorrow VEX will show your project continuity',
    minimal_normal: 'Tomorrow VEX will show your simple progress',
  },
  notificationCopy: {
    title: {
      student: 'Your next study block is small',
      game_like: 'Your next clean run is ready',
      deep_creative: 'Your project thread is waiting',
      minimal_normal: 'One clean block ready',
    },
    body: {
      student: '15-minute study block. One topic. VEX has it ready.',
      game_like: 'Clean run. 15 minutes. Name the target and start.',
      deep_creative: 'Re-enter the project. One concrete step.',
      minimal_normal: '10-minute block. Start when ready.',
    },
  },
  premiumTrigger: { day: 1, trigger: 'none', copyKey: 'none' },
  returnReason: {
    student: 'VEX knows what I need to study or review next.',
    game_like: 'VEX helps me build momentum and understand what blocks me.',
    deep_creative: 'VEX remembers where I left off.',
    minimal_normal: 'VEX gives me one useful action without noise.',
  },
};
