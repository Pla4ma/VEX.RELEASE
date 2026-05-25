import type { Lane, LaneProfile } from '../lane-engine/types';
import type { FirstWeekExperience, FirstWeekStage } from './first-week-schemas';

type LaneCopy = Pick<FirstWeekExperience, 'laneStageTheme' | 'primaryMessage' | 'unlockExplanation'>;

const DAY_0: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: 'first_study_block',
    primaryMessage: 'Start first study block.',
    unlockExplanation: 'Because your setup points toward school work, VEX starts with one study block before opening Study OS.',
  },
  game_like: {
    laneStageTheme: 'first_focus_run',
    primaryMessage: 'Start first run.',
    unlockExplanation: 'Because game-style motivation fits you, VEX starts with one real focus run and only a tiny boss preview.',
  },
  deep_creative: {
    laneStageTheme: 'first_project_block',
    primaryMessage: 'Protect first project block.',
    unlockExplanation: 'Because creative continuity matters, VEX starts by protecting one project block.',
  },
  minimal_normal: {
    laneStageTheme: 'first_clean_session',
    primaryMessage: 'Start first clean session.',
    unlockExplanation: 'Because quiet structure fits best, VEX keeps Day 0 to one clean session.',
  },
};

const PATH: Record<Lane, string> = {
  student: 'Study OS path opens after real study rhythm.',
  game_like: 'Run Board opens after VEX sees enough completed encounters.',
  deep_creative: 'Project Focus Path opens when VEX can preserve next moves.',
  minimal_normal: 'Today Strip opens when VEX has enough rhythm to stay useful and quiet.',
};

export function resolveLaneCopy(
  stage: FirstWeekStage,
  laneProfile: LaneProfile,
  fallbackMessage: string,
): LaneCopy {
  if (stage === 'DAY_0_NOT_STARTED') return DAY_0[laneProfile.primaryLane];
  const pathExplanation = PATH[laneProfile.primaryLane];
  if (stage === 'DAY_5_PATH_FORMING') {
    return {
      laneStageTheme: `${laneProfile.primaryLane}_path_forming`,
      primaryMessage: pathExplanation,
      unlockExplanation: pathExplanation,
    };
  }
  if (stage === 'DAY_7_DEEPER_MODE') {
    return {
      laneStageTheme: `${laneProfile.primaryLane}_weekly_intelligence`,
      primaryMessage: 'Weekly intelligence is ready after seven completed sessions.',
      unlockExplanation: 'VEX can now compare first-week behavior and suggest one next experiment.',
    };
  }
  return {
    laneStageTheme: `${laneProfile.primaryLane}_${stage.toLowerCase()}`,
    primaryMessage: fallbackMessage,
    unlockExplanation: pathExplanation,
  };
}

export function resolveFirstWeekExperiment(lane: Lane, stage: FirstWeekStage): FirstWeekExperience['firstWeekExperiment'] {
  if (stage === 'DAY_0_NOT_STARTED') return null;
  const actionByLane: Record<Lane, string> = {
    student: 'Repeat one study block before adding complexity.',
    game_like: 'Complete one clean encounter without economy systems.',
    deep_creative: 'Save one next move at completion.',
    minimal_normal: 'Keep the next session quiet and short.',
  };
  return {
    title: 'Next first-week experiment',
    action: actionByLane[lane],
  };
}
