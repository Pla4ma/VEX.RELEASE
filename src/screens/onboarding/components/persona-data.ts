import { launchColors } from '@theme/tokens/launch-colors';

export type CoachPersonaType = 'cheerleader' | 'mentor' | 'drill-sergeant';

export interface CoachPersona {
  id: CoachPersonaType;
  icon: string;
  name: string;
  description: string;
  examples: string[];
  color: string;
}

export const PERSONAS: CoachPersona[] = [
  {
    id: 'cheerleader',
    icon: '🎉',
    name: 'The Cheerleader',
    description: 'Enthusiastic, encouraging',
    examples: [
      '"You\'re absolutely crushing this! 🔥"',
      '"I knew you had it in you! Keep going!"',
    ],
    color: launchColors.hex_f59e0b,
  },
  {
    id: 'mentor',
    icon: '📚',
    name: 'The Mentor',
    description: 'Calm, wise, strategic',
    examples: [
      '"Small steps lead to big progress."',
      '"Your consistency is building something great."',
    ],
    color: launchColors.hex_3b82f6,
  },
  {
    id: 'drill-sergeant',
    icon: '💀',
    name: 'The Drill Sergeant',
    description: 'Intense, zero tolerance',
    examples: [
      '"Excuses don\'t build empires. Focus!"',
      '"You asked for this. Now deliver."',
    ],
    color: launchColors.hex_ef4444,
  },
];
