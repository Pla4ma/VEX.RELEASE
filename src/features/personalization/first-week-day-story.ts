import type { FirstWeekStage, FirstWeekExperience } from './first-week-schemas';
import type { WeeklyRecommendation } from './first-week-engines';

const EMOTIONAL_GOALS: Record<string, string> = {
  DAY_0_NOT_STARTED: 'I am ready to start — VEX matches me.',
  DAY_1_RETURN: 'VEX remembers me. I am not starting over.',
  DAY_2_PROGRESS_PROOF: 'I see evidence. This is working.',
  DAY_3_COMPANION_CONNECTION: 'VEX actually learned something real.',
  DAY_4_RECOVERY: 'Even a small session counts. VEX has my back.',
  DAY_5_PATH_FORMING: 'This mode is starting to feel personal.',
  DAY_6_WEEKLY_PREP: 'Something big is coming. One more session.',
  DAY_7_DEEPER_MODE: 'VEX understood me. Tomorrow will be easier.',
  POST_DAY_7: 'VEX knows how I work now. This is my tool.',
};

const LANE_RETURN_DESCRIPTIONS: Record<string, string> = {
  student: 'your study lane',
  game_like: 'your run pattern',
  deep_creative: 'your project thread',
  minimal_normal: 'your rhythm',
};

export function deriveDayStory(
  stage: FirstWeekStage,
  lane: string,
  weeklyRec: WeeklyRecommendation | null,
): FirstWeekExperience['dayStory'] {
  return {
    emotionalGoal: EMOTIONAL_GOALS[stage] ?? 'I am building something real.',
    nudgeBehavior: stage === 'DAY_0_NOT_STARTED'
      ? 'No notification — first session must be self-initiated.'
      : stage === 'DAY_4_RECOVERY'
        ? 'Gentle evening reminder if no session yet. No guilt, just presence.'
        : stage === 'DAY_7_DEEPER_MODE'
          ? "Morning celebration nudge: 'Your weekly intelligence is ready.'"
          : 'Coach check-in if no session by mid-afternoon.',
    reasonToReturnTomorrow: stage === 'DAY_7_DEEPER_MODE'
      ? 'VEX is smarter now. Week 2 starts with real insight.'
      : stage === 'DAY_6_WEEKLY_PREP'
        ? 'One session away from your first weekly intelligence moment.'
        : `VEX learns from every session. Tomorrow ${
            LANE_RETURN_DESCRIPTIONS[lane] ?? 'your pattern'
          } will be sharper.`,
    suggestedAdjustment: weeklyRec?.suggestedAdjustment ?? null,
  };
}
