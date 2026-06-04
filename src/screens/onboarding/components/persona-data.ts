import { lightColors } from '@/theme/tokens/colors';


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
    icon: 'star',
    name: 'The Cheerleader',
    description: 'Enthusiastic, encouraging',
    examples: [
      '"You\'re absolutely crushing this!"',
      '"I knew you had it in you! Keep going!"',
    ],
    color: lightColors.semantic.warning,
  },
  {
    id: 'mentor',
    icon: 'compass',
    name: 'The Mentor',
    description: 'Calm, wise, strategic',
    examples: [
      '"Small steps lead to big progress."',
      '"Your consistency is building something great."',
    ],
    color: lightColors.accent.blue,
  },
  {
    id: 'drill-sergeant',
    icon: 'bolt',
    name: 'The Drill Sergeant',
    description: 'Intense, zero tolerance',
    examples: [
      '"Excuses don\'t build empires. Focus!"',
      '"You asked for this. Now deliver."',
    ],
    color: lightColors.semantic.danger,
  },
];
