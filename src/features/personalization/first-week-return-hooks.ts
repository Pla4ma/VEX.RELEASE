import type { Lane } from '../lane-engine/types';
import type { FirstWeekStage } from './first-week-schemas';

export const RETURN_TOMORROW_HOOK: Record<Lane, Record<string, string>> = {
  student: {
    completion_day0: 'Tomorrow, continue with the next study block.',
    completion_day1: 'VEX will show what you have built in study so far.',
    completion_day2: 'Tomorrow VEX will share something real it learned.',
    completion_day3: 'VEX will keep learning. Tomorrow it adapts.',
    completion_day4: 'VEX respects your pace. Your study lane holds steady.',
    completion_day5: 'Tomorrow VEX prepares a look at your full study week.',
    completion_day6: 'Return tomorrow for your first weekly study intelligence.',
    completion_day7: 'Week 2 starts tomorrow. VEX is smarter now.',
  },
  game_like: {
    completion_day0: 'Your next run starts from this clean opening.',
    completion_day1: 'VEX will show your run progress tomorrow.',
    completion_day2: 'Tomorrow VEX will share something real it learned.',
    completion_day3: 'VEX will keep learning. Tomorrow it adapts to your runs.',
    completion_day4: 'Recovery is part of the run. VEX is ready when you are.',
    completion_day5: 'Tomorrow VEX prepares a look at your full run week.',
    completion_day6: 'Return tomorrow for your first weekly run intelligence.',
    completion_day7: 'Week 2 starts tomorrow. VEX is smarter now.',
  },
  deep_creative: {
    completion_day0: 'Your next block starts from the next move you saved.',
    completion_day1: 'VEX will show your project continuity tomorrow.',
    completion_day2: 'Tomorrow VEX will share something real it learned.',
    completion_day3: 'VEX will keep learning. Tomorrow it adapts to your flow.',
    completion_day4: 'Your thread is safe. Return when inspiration finds you.',
    completion_day5: 'Tomorrow VEX prepares a look at your full project week.',
    completion_day6: 'Return tomorrow for your first weekly project intelligence.',
    completion_day7: 'Week 2 starts tomorrow. VEX is smarter now.',
  },
  minimal_normal: {
    completion_day0: 'Tomorrow starts with one clean action.',
    completion_day1: 'VEX will show your simple progress tomorrow.',
    completion_day2: 'Tomorrow VEX will share something real it learned.',
    completion_day3: 'VEX will keep learning. Tomorrow it adapts to your pace.',
    completion_day4: 'Clean means not forcing it. VEX is here when you return.',
    completion_day5: 'Tomorrow VEX prepares a look at your full week.',
    completion_day6: 'Return tomorrow for your first weekly intelligence.',
    completion_day7: 'Week 2 starts tomorrow. VEX is smarter now.',
  },
};

const STAGE_TO_HOOK_KEY: Record<FirstWeekStage, string> = {
  DAY_0_NOT_STARTED: 'completion_day0',
  DAY_0_FIRST_SESSION_STARTED: 'completion_day0',
  DAY_1_RETURN: 'completion_day1',
  DAY_2_PROGRESS_PROOF: 'completion_day2',
  DAY_3_COMPANION_CONNECTION: 'completion_day3',
  DAY_4_RECOVERY: 'completion_day4',
  DAY_5_PATH_FORMING: 'completion_day5',
  DAY_6_WEEKLY_PREP: 'completion_day6',
  DAY_7_DEEPER_MODE: 'completion_day7',
  POST_DAY_7: 'completion_day7',
};

export function resolveReturnTomorrowHook(
  stage: FirstWeekStage,
  lane: Lane,
): string {
  const key = STAGE_TO_HOOK_KEY[stage] ?? 'completion_day0';
  return RETURN_TOMORROW_HOOK[lane]?.[key] ?? '';
}
