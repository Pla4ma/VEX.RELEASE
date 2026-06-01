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
    color: '#4ecdc4',
  },
  STREAK_PROTECTION: {
    icon: '🔥',
    title: 'Save Your Streak',
    color: '#fc8181',
  },
  COMEBACK_BUILDER: {
    icon: '💪',
    title: 'Comeback Time',
    color: '#68d391',
  },
  DIFFICULTY_ADJUST: {
    icon: '⚙️',
    title: 'Smart Adjustment',
    color: '#a0aec0',
  },
  CHALLENGE_SYNC: {
    icon: '🎮',
    title: 'Challenge Ready',
    color: '#f6ad55',
  },
  BOSS_PREP: {
    icon: '⚔️',
    title: 'Boss Battle Prep',
    color: '#9f7aea',
  },
  HABIT_BUILDER: {
    icon: '📅',
    title: 'Build The Habit',
    color: '#63b3ed',
  },
  ENERGY_BASED: {
    icon: '⚡',
    title: 'Energy Match',
    color: '#f6e05e',
  },
};

export const styles = createSheet({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: '#000',
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
    color: '#666',
  },
  reasoning: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    color: '#fff',
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
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
