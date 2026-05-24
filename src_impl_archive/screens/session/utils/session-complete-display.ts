import type { ChestTier } from '../../../features/rewards/chest-engine';
import type { SessionSummary } from '../../../session/types';
import type { Theme } from '../../../theme/types';

type DisplayState = { label: string; color: string };

export function getGradeDisplay(score: number, theme: Theme): DisplayState & { letter: string } {
  if (score >= 900) {return { letter: 'S', label: 'Legendary Run', color: theme.colors.warning.light };}
  if (score >= 800) {return { letter: 'A', label: 'Dominant Focus', color: theme.colors.success.light };}
  if (score >= 700) {return { letter: 'B', label: 'Sharp Session', color: theme.colors.success.DEFAULT };}
  if (score >= 600) {return { letter: 'C', label: 'Solid Work', color: theme.colors.warning.DEFAULT };}
  if (score >= 500) {return { letter: 'D', label: 'Still Progress', color: theme.colors.error.light };}
  return { letter: 'F', label: 'Come Back Stronger', color: theme.colors.error.DEFAULT };
}

export function getPurityDisplay(score: number, theme: Theme): DisplayState {
  if (score >= 90) {return { label: 'Elite Focus 🔥', color: theme.colors.warning.light };}
  if (score >= 70) {return { label: 'Good Focus', color: theme.colors.success.DEFAULT };}
  return { label: 'Distracted', color: theme.colors.error.light };
}

export function getChestTierDisplay(tier: ChestTier, theme: Theme): DisplayState {
  if (tier === 'legendary') {return { label: 'LEGENDARY CHEST', color: theme.colors.warning.light };}
  if (tier === 'epic') {return { label: 'EPIC CHEST', color: theme.colors.primary[400] };}
  if (tier === 'rare') {return { label: 'RARE CHEST', color: theme.colors.info.light };}
  return { label: 'COMMON CHEST', color: theme.colors.text.secondary };
}

export function getSessionBattlePassXp(summary: SessionSummary): number {
  const quality = summary.focusPurityScore ?? summary.focusQuality ?? 0;
  const minutes = Math.max(0, Math.floor(summary.effectiveDuration / 60000));
  return Math.max(0, Math.floor(minutes * (quality / 100)));
}
