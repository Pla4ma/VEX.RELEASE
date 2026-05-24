import type { NarrativeBeat } from './narrative-schemas';

export interface NarrativeTemplate {
  id: string;
  type: NarrativeBeat['type'];
  conditions: Record<string, unknown>;
  templates: string[];
  intensity: number;
}

export const NARRATIVE_TEMPLATES: NarrativeTemplate[] = [
  {
    id: 'opening_standard',
    type: 'OPENING',
    conditions: {},
    templates: [
      'The journey begins...',
      'You enter the arena of focus.',
      'A new challenge awaits.',
      'The clock starts. Your focus is your weapon.',
    ],
    intensity: 0.2,
  },
  {
    id: 'interruption_single',
    type: 'INTERRUPTION',
    conditions: { count: 1 },
    templates: [
      'A distraction tests your resolve.',
      'The first interruption strikes.',
      'Focus wavers, but you hold the line.',
    ],
    intensity: 0.3,
  },
  {
    id: 'interruption_multiple',
    type: 'INTERRUPTION',
    conditions: { count: 'multiple' },
    templates: [
      'The distractions mount. Each one you defeat makes you stronger.',
      'Battle-tested through {count} interruptions.',
      'Chaos swirls around you, but your focus remains unbroken.',
    ],
    intensity: 0.5,
  },
  {
    id: 'recovery_quick',
    type: 'RECOVERY',
    conditions: { recoveryTime: 'quick' },
    templates: [
      'Swift recovery. Your focus muscle is strong.',
      'Back in the flow almost instantly.',
    ],
    intensity: 0.4,
  },
  {
    id: 'pure_focus_streak_short',
    type: 'PURE_FOCUS_STREAK',
    conditions: { duration: 'short' },
    templates: [
      '{duration} minutes of pure, unbroken focus.',
      'The flow state takes hold.',
    ],
    intensity: 0.4,
  },
  {
    id: 'pure_focus_streak_long',
    type: 'PURE_FOCUS_STREAK',
    conditions: { duration: 'long' },
    templates: [
      'An epic {duration}-minute streak of pure focus!',
      'Legendary concentration. Nothing can break your flow.',
      'The zone. {duration} minutes of pure mastery.',
    ],
    intensity: 0.7,
  },
  {
    id: 'combo_achieved',
    type: 'COMBO_ACHIEVED',
    conditions: {},
    templates: [
      '{combo}x COMBO! Pure focus amplified!',
      'The momentum builds. {combo} consecutive pure strikes!',
    ],
    intensity: 0.6,
  },
  {
    id: 'boss_rage',
    type: 'BOSS_PHASE_CHANGE',
    conditions: { phase: 'rage' },
    templates: [
      'The boss grows desperate. Its health dips below 25%.',
      'The enemy is wounded but dangerous.',
    ],
    intensity: 0.6,
  },
  {
    id: 'near_death_epic',
    type: 'NEAR_DEATH_MOMENT',
    conditions: {},
    templates: [
      'ALMOST THERE! The boss trembles at 10% health!',
      'The final push. Victory is within reach!',
      'Tension peaks. One more focused push!',
    ],
    intensity: 0.9,
  },
  {
    id: 'final_push_close',
    type: 'FINAL_PUSH',
    conditions: { margin: 'close' },
    templates: [
      'With seconds remaining, you land the final blow!',
      'A dramatic finish! Victory snatched at the last moment!',
    ],
    intensity: 0.95,
  },
  {
    id: 'victory_triumph',
    type: 'VICTORY',
    conditions: { healthRemaining: 'high' },
    templates: [
      'DOMINANT VICTORY! The boss stood no chance.',
      'Masterful performance. Pure focus prevails.',
    ],
    intensity: 0.8,
  },
  {
    id: 'victory_comeback',
    type: 'VICTORY',
    conditions: { healthRemaining: 'low' },
    templates: [
      'EPIC COMEBACK! Against all odds, you emerge victorious!',
      'The comeback is complete! Never give up!',
    ],
    intensity: 1.0,
  },
  {
    id: 'defeat_close',
    type: 'DEFEAT',
    conditions: { margin: 'close' },
    templates: [
      'So close! The boss escaped with mere slivers of health.',
      'A noble effort. Next time, victory is yours.',
    ],
    intensity: 0.5,
  },
];

export const HERO_QUOTES: Record<
  'triumph' | 'struggle' | 'comeback' | 'mastery' | 'learning',
  string[]
> = {
  triumph: [
    '"Discipline is choosing between what you want now and what you want most."',
    "\"The only bad workout is the one that didn't happen.\"",
    '"Success is the sum of small efforts, repeated day in and day out."',
  ],
  struggle: [
    "\"The struggle you're in today is developing the strength you need for tomorrow.\"",
    '"It does not matter how slowly you go as long as you do not stop."',
    '"Every expert was once a beginner."',
  ],
  comeback: [
    "\"It's not whether you get knocked down, it's whether you get up.\"",
    '"The comeback is always stronger than the setback."',
    '"Fall seven times, stand up eight."',
  ],
  mastery: [
    '"Mastery is not a function of genius or talent. It is a function of time and intense focus."',
    '"The master has failed more times than the beginner has even tried."',
  ],
  learning: [
    '"Every session is a lesson. Every interruption is a teacher."',
    '"Progress, not perfection."',
  ],
};
