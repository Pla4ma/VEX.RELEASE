/**
 * Session Suggestion Card — type config and styles
 */

import type { RecommendationType } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export const TYPE_CONFIG: Record<
  RecommendationType,
  { icon: string; title: string; color: string }
> = {
  OPTIMAL_TIME: {
    icon: '🎯',
    title: 'Perfect Timing',
    color: lightColors.accent.teal,
  },
  STREAK_PROTECTION: {
    icon: '🔥',
    title: 'Save Your Streak',
    color: lightColors.error.light,
  },
  COMEBACK_BUILDER: {
    icon: '💪',
    title: 'Comeback Time',
    color: lightColors.semantic.success,
  },
  DIFFICULTY_ADJUST: {
    icon: '⚙️',
    title: 'Smart Adjustment',
    color: lightColors.text.disabled,
  },
  CHALLENGE_SYNC: {
    icon: '🎮',
    title: 'Challenge Ready',
    color: lightColors.semantic.warning,
  },
  BOSS_PREP: {
    icon: '⚔️',
    title: 'Boss Battle Prep',
    color: lightColors.accent.purple,
  },
  HABIT_BUILDER: {
    icon: '📅',
    title: 'Build The Habit',
    color: lightColors.accent.blue,
  },
  ENERGY_BASED: {
    icon: '⚡',
    title: 'Energy Match',
    color: lightColors.semantic.warning,
  },
};

export const styles = createSheet({
  container: {
    backgroundColor: lightColors.text.inverse,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  confidence: {
    fontSize: 12,
    color: lightColors.text.muted,
  },
  reasoning: {
    fontSize: 15,
    lineHeight: 22,
    color: lightColors.text.secondary,
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.surface.button,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: lightColors.text.muted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: lightColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: lightColors.text.muted,
    fontSize: 16,
    fontWeight: '500',
  },
});
