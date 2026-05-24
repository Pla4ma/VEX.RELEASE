import { eventBus } from '../../events';
import { resolveSessionMode, SessionMode } from '../../session/modes';
import { captureWeeklyQuestError, recordWeeklyQuestProgress } from './analytics';
import {
  WEEKLY_QUEST_COMPLETED_EVENT,
  WEEKLY_QUEST_PROGRESS_EVENT,
} from './events';
import { fetchWeeklyQuestState, saveWeeklyQuestState } from './repository';
import {
  WeeklyQuestSessionInputSchema,
  WeeklyQuestStateSchema,
  type WeeklyQuestSessionInput,
  type WeeklyQuestState,
  type WeeklyQuestStep,
  type WeeklyQuestStepId,
} from './schemas';

/*
Dependencies: sessions, boss damage, streaks, inventory item usage, rewards
Consumers: session completion integration, home return plan, analytics, rewards
*/

const STEP_ORDER: Array<{ id: WeeklyQuestStepId; title: string; target: number }> = [
  { id: 'complete_three_sessions', title: 'Complete 3 sessions', target: 3 },
  { id: 'earn_two_a_grades', title: 'Earn A-grade or better twice', target: 2 },
  { id: 'deal_boss_damage', title: 'Deal 500 boss damage', target: 500 },
  { id: 'complete_study_session', title: 'Complete a Study session', target: 1 },
  { id: 'maintain_five_day_streak', title: 'Hold a 5-day streak', target: 5 },
  { id: 'use_session_item', title: 'Use a session item', target: 1 },
  { id: 'defeat_boss', title: 'Defeat a boss', target: 1 },
];

export function getWeekKey(timestamp: number): string {
  const date = new Date(timestamp);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.floor((dayOffset + firstDay.getDay()) / 7) + 1;
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function createInitialWeeklyQuestState(
  userId: string,
  timestamp: number,
): WeeklyQuestState {
  const steps: WeeklyQuestStep[] = STEP_ORDER.map((step) => ({
    ...step,
    progress: 0,
    completed: false,
  }));
  return WeeklyQuestStateSchema.parse({
    userId,
    weekKey: getWeekKey(timestamp),
    steps,
    completedAt: null,
    legendaryBoostArmed: false,
    updatedAt: timestamp,
  });
}

function updateStep(
  state: WeeklyQuestState,
  id: WeeklyQuestStepId,
  delta: number,
): WeeklyQuestState {
  return {
    ...state,
    steps: state.steps.map((step) => {
      if (step.id !== id || step.completed) {
        return step;
      }
      const progress = Math.min(step.target, step.progress + delta);
      return { ...step, progress, completed: progress >= step.target };
    }),
  };
}

export function applyWeeklyQuestSession(
  state: WeeklyQuestState,
  input: WeeklyQuestSessionInput,
): WeeklyQuestState {
  const validated = WeeklyQuestSessionInputSchema.parse(input);
  let nextState = updateStep(state, 'complete_three_sessions', 1);
  if (validated.finalScore >= 85) {nextState = updateStep(nextState, 'earn_two_a_grades', 1);}
  if (validated.bossDamage > 0) {nextState = updateStep(nextState, 'deal_boss_damage', validated.bossDamage);}
  if (resolveSessionMode(validated.sessionMode) === SessionMode.STUDY) {
    nextState = updateStep(nextState, 'complete_study_session', 1);
  }
  if (validated.streakDays >= 5) {
    nextState = updateStep(nextState, 'maintain_five_day_streak', validated.streakDays);
  }
  if (validated.usedSessionItem) {nextState = updateStep(nextState, 'use_session_item', 1);}
  if (validated.bossDefeated) {nextState = updateStep(nextState, 'defeat_boss', 1);}

  const isComplete = nextState.steps.every((step) => step.completed);
  return WeeklyQuestStateSchema.parse({
    ...nextState,
    completedAt: nextState.completedAt ?? (isComplete ? validated.completedAt : null),
    legendaryBoostArmed: nextState.legendaryBoostArmed || isComplete,
    updatedAt: validated.completedAt,
  });
}

export async function recordWeeklyQuestSession(
  input: WeeklyQuestSessionInput,
): Promise<WeeklyQuestState> {
  const validated = WeeklyQuestSessionInputSchema.parse(input);
  const weekKey = getWeekKey(validated.completedAt);
  const current =
    (await fetchWeeklyQuestState(validated.userId, weekKey)) ??
    createInitialWeeklyQuestState(validated.userId, validated.completedAt);
  const next = applyWeeklyQuestSession(current, validated);
  await saveWeeklyQuestState(next);
  recordWeeklyQuestProgress(next);
  eventBus.publish(WEEKLY_QUEST_PROGRESS_EVENT, next);
  if (next.completedAt && !current.completedAt) {
    eventBus.publish(WEEKLY_QUEST_COMPLETED_EVENT, {
      userId: validated.userId,
      weekKey,
      reward: { coins: 500, gems: 25, nextChest: 'LEGENDARY' },
    });
  }
  return next;
}

export async function getWeeklyQuestStateForUser(
  userId: string,
  timestamp: number,
): Promise<WeeklyQuestState> {
  const weekKey = getWeekKey(timestamp);
  return (
    (await fetchWeeklyQuestState(userId, weekKey)) ??
    createInitialWeeklyQuestState(userId, timestamp)
  );
}

export async function consumeWeeklyLegendaryBoost(
  userId: string,
  timestamp: number,
): Promise<boolean> {
  const state = await getWeeklyQuestStateForUser(userId, timestamp);
  if (!state.legendaryBoostArmed) {
    return false;
  }
  await saveWeeklyQuestState({
    ...state,
    legendaryBoostArmed: false,
    updatedAt: timestamp,
  });
  return true;
}

export async function recordWeeklyQuestSessionSafely(
  input: WeeklyQuestSessionInput,
): Promise<void> {
  try {
    await recordWeeklyQuestSession(input);
  } catch (error) {
    captureWeeklyQuestError(error);
  }
}
