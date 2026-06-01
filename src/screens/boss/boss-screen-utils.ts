import type {
  BossEncounterSummary,
  BossTemplate,
} from '../../features/boss/schemas';

export const ATTACK_PRESETS = [
  { minutes: 15, label: '15m focused block' },
  { minutes: 25, label: '25m focus block' },
  { minutes: 60, label: '60m deep block' },
] as const;

export type BossIntensity = 'subtle' | 'game-like' | 'intense';

export type BossScreenSectionsProps = {
  bossIntensity?: BossIntensity;
  encounter: BossEncounterSummary;
  onLaunchAttack: (minutes: number) => void;
  progressionLevel: number;
  streakMultiplier: number;
  template?: BossTemplate;
  userDamage: number;
  userId: string;
};

export function getBossScreenCopy(intensity: BossIntensity): {
  actionLabel: string;
  historyTitle: string;
  intro: string;
  metricLabel: string;
  title: string;
} {
  if (intensity === 'subtle') {
    return {
      actionLabel: 'Start focus block',
      historyTitle: 'Momentum history',
      intro:
        'Each completed session moves this marker forward. Just proof that you returned.',
      metricLabel: 'Momentum earned',
      title: 'Focus Momentum',
    };
  }
  if (intensity === 'intense') {
    return {
      actionLabel: 'Start focused push',
      historyTitle: 'Recent pressure',
      intro:
        'Your completed sessions reduce boss health. Strong focus hits harder, but the work stays the center.',
      metricLabel: 'Total damage',
      title: 'Boss Focus',
    };
  }
  return {
    actionLabel: 'Start boss focus',
    historyTitle: 'Recent hits',
    intro: 'Focus sessions chip boss health down one clean block at a time.',
    metricLabel: 'Total damage',
    title: 'Boss Health',
  };
}

export function estimateDamage(
  minutes: number,
  streakMultiplier: number,
): number {
  return Math.max(1, Math.round(minutes * streakMultiplier * 1.5));
}

export function formatDuration(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}
