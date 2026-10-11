import { vexFire } from "@/theme/tokens/vex-fire";
/**
 * Session Suggestion Card — type config and styles
 */

import type { RecommendationType } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';



export const TYPE_CONFIG: Record<
  RecommendationType,
  { icon: string; title: string; color: string }
> = {
  OPTIMAL_TIME: {
    icon: '🎯',
    title: 'Perfect Timing',
    color: vexFire.amber,
  },
  STREAK_PROTECTION: {
    icon: '🔥',
    title: 'Save Your Streak',
    color: vexFire.danger,
  },
  COMEBACK_BUILDER: {
    icon: '💪',
    title: 'Comeback Time',
    color: vexFire.success,
  },
  DIFFICULTY_ADJUST: {
    icon: '⚙️',
    title: 'Smart Adjustment',
    color: vexFire.textMuted,
  },
  CHALLENGE_SYNC: {
    icon: '🎮',
    title: 'Challenge Ready',
    color: vexFire.amber,
  },
  BOSS_PREP: {
    icon: '⚔️',
    title: 'Boss Battle Prep',
    color: vexFire.copper,
  },
  HABIT_BUILDER: {
    icon: '📅',
    title: 'Build The Habit',
    color: vexFire.amber,
  },
  ENERGY_BASED: {
    icon: '⚡',
    title: 'Energy Match',
    color: vexFire.amber,
  },
};

export const styles = createSheet({
  container: {
    backgroundColor: vexFire.cream,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: vexFire.cream,
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
    color: vexFire.textMuted,
  },
  reasoning: {
    fontSize: 15,
    lineHeight: 22,
    color: vexFire.textSecondary,
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: vexFire.ember,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: vexFire.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: vexFire.textSecondary,
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
    color: vexFire.cream,
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
    color: vexFire.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});
