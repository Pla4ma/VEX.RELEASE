import type { PersonalityEventType } from './personality-responses';

export type TriggerFn = (
  type: PersonalityEventType,
  userId: string,
  customDialogue?: string[],
) => void;

export function handleBossDefeated(
  trigger: TriggerFn,
  event: unknown,
): void {
  const payload = event as { bossName?: string; userId: string };
  const customDialogue = payload.bossName
    ? [`${payload.bossName} is down!`, 'Your focus was unstoppable!']
    : undefined;
  trigger('BOSS_DEFEATED', payload.userId, customDialogue);
}

export function handleSessionCompleted(
  trigger: TriggerFn,
  event: unknown,
): void {
  const payload = event as {
    grade?: string;
    purity?: number;
    userId: string;
  };
  if (payload.grade === 'S') {
    trigger('S_GRADE_SESSION', payload.userId);
  } else if (payload.purity !== undefined && payload.purity >= 95) {
    trigger('PERFECT_SESSION', payload.userId);
  }
}

export function handleStreakMilestone(
  trigger: TriggerFn,
  event: unknown,
): void {
  const payload = event as { days: number; userId: string };
  if (payload.days === 7 || payload.days === 14 || payload.days === 30) {
    const customDialogue =
      payload.days === 7
        ? ['One week! We are just getting started.']
        : payload.days === 14
          ? ['14 days. That is not luck. That is discipline.']
          : ['30-day streak!', 'You have built something real.'];
    trigger('STREAK_MILESTONE', payload.userId, customDialogue);
  }
}

export function handleStreakBroken(
  trigger: TriggerFn,
  event: unknown,
): void {
  const payload = event as { previousStreak: number; userId: string };
  const customDialogue =
    payload.previousStreak >= 7
      ? [
          `${payload.previousStreak}-day streak ends.`,
          'But your skills do not. Reset with me.',
        ]
      : undefined;
  trigger('STREAK_BROKEN', payload.userId, customDialogue);
}

export function handleUserReturned(
  trigger: TriggerFn,
  event: unknown,
): void {
  const payload = event as { daysAbsent: number; userId: string };
  if (payload.daysAbsent >= 3) {
    const customDialogue =
      payload.daysAbsent >= 7
        ? ['Been a while.', 'But you are here now. That is enough.']
        : ['You came back!', 'That is what matters.'];
    trigger('COMEBACK', payload.userId, customDialogue);
  }
}

export function handleLevelUp(trigger: TriggerFn, event: unknown): void {
  const payload = event as { newLevel: number; userId: string };
  trigger('LEVEL_UP', payload.userId, [
    `Level ${payload.newLevel}!`,
    'Growing stronger together.',
  ]);
}
