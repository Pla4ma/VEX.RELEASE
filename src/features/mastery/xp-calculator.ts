import type { MasteryState } from './types';
export type { MasteryState } from './types';

export function calculateTechniqueXp(
  sessionMinutes: number,
  purityScore: number,
  wasInterrupted: boolean,
  streakDays: number,
  bossDefeated: boolean,
  bossHealthPercent: number,
): Record<keyof MasteryState['techniques'], number> {
  return {
    durationMastery: wasInterrupted
      ? 0
      : Math.floor(sessionMinutes * (purityScore / 100)),
    purityMastery: purityScore >= 90 ? Math.floor(purityScore / 10) : 0,
    consistencyMastery: streakDays > 0 ? 2 : 0,
    comebackMastery: streakDays === 1 ? 10 : 0,
    bossMastery: bossDefeated
      ? Math.floor(20 * (1 + (1 - bossHealthPercent)))
      : 0,
  };
}

const RANK_DISPLAY: Record<string, { title: string; icon: string }> = {
  APPRENTICE: { title: 'Apprentice', icon: '🟢' },
  ADEPT: { title: 'Adept', icon: '🔵' },
  EXPERT: { title: 'Expert', icon: '🟣' },
  MASTER: { title: 'Master', icon: '🟠' },
  GRANDMASTER: { title: 'Grandmaster', icon: '⭐' },
};

export function getMasteryRankDisplay(rank: string): { title: string; icon: string } {
  return RANK_DISPLAY[rank] ?? { title: rank, icon: '📊' };
}
