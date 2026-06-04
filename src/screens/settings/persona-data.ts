import { lightColors } from '@/theme/tokens/colors';
export type CoachPersona = 'cheerleader' | 'mentor' | 'drill-sergeant';

export interface PersonaOption {
  id: CoachPersona;
  label: string;
  emoji: string;
  description: string;
  exampleMessages: string[];
  color: string;
}

export const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'cheerleader',
    label: 'The Cheerleader',
    emoji: '',
    description: 'Enthusiastic, encouraging, high energy',
    exampleMessages: [
      "You're absolutely crushing it.",
      'That focus session was outstanding.',
    ],
    color: lightColors.accent.pink,
  },
  {
    id: 'mentor',
    label: 'The Mentor',
    emoji: '',
    description: 'Calm, wise, strategic guidance',
    exampleMessages: [
      'Your consistency is building momentum.',
      'Consider a longer session tomorrow for deeper focus.',
    ],
    color: lightColors.accent.blue,
  },
  {
    id: 'drill-sergeant',
    label: 'The Drill Sergeant',
    emoji: '',
    description: 'Intense, zero tolerance for excuses',
    exampleMessages: [
      'Excuses are for losers. FOCUS!',
      'Your enemy is winning while you hesitate.',
    ],
    color: lightColors.semantic.danger,
  },
];
