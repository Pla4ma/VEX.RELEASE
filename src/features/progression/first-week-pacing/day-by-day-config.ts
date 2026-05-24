import { z } from 'zod';

export const DayDesignSchema = z.object({
  day: z.number().int().min(0).max(7),
  sessionNumber: z.number().int().min(1).max(7),
  theme: z.string(),
  description: z.string(),
  promptTitle: z.string(),
  promptBody: z.string(),
  unlocks: z.array(z.string()),
});

export type DayDesign = z.infer<typeof DayDesignSchema>;

export const FIRST_WEEK_DAY_DESIGN: DayDesign[] = [
  {
    day: 0, sessionNumber: 1,
    theme: 'Start',
    description: 'Your first session. No extra systems, no pressure. Just focus.',
    promptTitle: 'Let your first session begin',
    promptBody: 'One focused session is all that matters today. Everything else comes after.',
    unlocks: ['focus_score'],
  },
  {
    day: 1, sessionNumber: 2,
    theme: 'Rhythm',
    description: 'Welcome back. Protect your rhythm with one clean session today.',
    promptTitle: 'Welcome back',
    promptBody: 'Your rhythm starts today. One session protects it for tomorrow.',
    unlocks: ['streak_basics'],
  },
  {
    day: 2, sessionNumber: 3,
    theme: 'Proof',
    description: 'See what you have built: minutes focused, streak alive, growth visible.',
    promptTitle: 'Your focus is adding up',
    promptBody: 'Minutes, streak, and progress show your consistency is real.',
    unlocks: ['companion_reveal', 'xp_system'],
  },
  {
    day: 3, sessionNumber: 4,
    theme: 'Companion',
    description: 'Your companion awakens and reflects your focus journey.',
    promptTitle: 'Your companion arrives',
    promptBody: 'A creature that grows with every session you complete. Meet it today.',
    unlocks: ['companion_detail', 'personalized_tips'],
  },
  {
    day: 4, sessionNumber: 5,
    theme: 'Strength',
    description: 'Your focus patterns are forming. VEX starts learning from them.',
    promptTitle: 'Your focus pattern is forming',
    promptBody: 'The app now knows your rhythm and can recommend better sessions.',
    unlocks: ['ai_coach_basic'],
  },
  {
    day: 5, sessionNumber: 6,
    theme: 'Challenge',
    description: 'Your first simple challenge appears. Just one small push.',
    promptTitle: 'Your first challenge awaits',
    promptBody: 'A small target based on your own history. No comparison, just your next step.',
    unlocks: ['first_challenge'],
  },
  {
    day: 6, sessionNumber: 7,
    theme: 'Deeper Mode',
    description: 'You finished your first week. Choose your path forward.',
    promptTitle: 'One week complete',
    promptBody: 'Your first week is done. Now choose what VEX becomes for you: calm companion, study coach, or game-like challenger.',
    unlocks: ['deeper_mode_choice'],
  },
];
