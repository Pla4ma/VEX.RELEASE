import { z } from 'zod';

/**
 * Elite Insights System
 * High-value productivity knowledge delivered as boss rewards.
 * This transforms the app from a game into a high-performance mentorship tool.
 */

export const EliteInsightSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['BIOLOGY', 'PSYCHOLOGY', 'SOCIOLOGY', 'TECHNOLOGY']),
  title: z.string(),
  body: z.string(),
  source: z.string().optional(),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']),
  unlockedAt: z.number().optional(),
}).strict();

export type EliteInsight = z.infer<typeof EliteInsightSchema>;

export const ELITE_INSIGHTS: EliteInsight[] = [
  {
    id: '4f6a7b8c-d9e0-4f1a-b2c3-d4e5f6a7b8c9',
    category: 'BIOLOGY',
    title: 'The Ultradian Rhythm',
    body: 'Focus is a physiological resource. Your brain cycles through 90-minute peaks of alertness followed by a 20-minute trough. Alignment > Discipline.',
    source: 'Dr. Nathaniel Kleitman',
    rarity: 'COMMON',
  },
  {
    id: '5f7b8c9d-e0f1-4a2b-b3c4-d5e6f7a8b9c0',
    category: 'PSYCHOLOGY',
    title: 'The Zeal of Zeigarnik',
    body: 'Unfinished tasks consume mental RAM. If you are distracted, write down the one next step for the task you left. This clears the cognitive load.',
    source: 'Bluma Zeigarnik',
    rarity: 'RARE',
  },
  {
    id: '6f8c9d0e-f1a2-4b3c-c4d5-e6f7a8b9c0d1',
    category: 'TECHNOLOGY',
    title: 'The Slot Machine Logic',
    body: 'Checking notifications triggers random intermittent reinforcement—the same mechanism as gambling. Use VEX Shield to block these dopamine loops.',
    rarity: 'EPIC',
  },
  {
    id: '7f9d0e1f-a2b3-4c4d-d5e6-f7a8b9c0d1e2',
    category: 'SOCIOLOGY',
    title: 'Dunbar’s Focus Limit',
    body: 'Social accountability works best in groups of 5. Larger squads dilute responsibility. Your VEX Squad Pact is optimized for this psychological limit.',
    source: 'Robin Dunbar',
    rarity: 'LEGENDARY',
  },
];

export function getRandomInsight(rarity?: EliteInsight['rarity']): EliteInsight {
  const available = rarity 
    ? ELITE_INSIGHTS.filter(i => i.rarity === rarity)
    : ELITE_INSIGHTS;
  
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex]!;
}
