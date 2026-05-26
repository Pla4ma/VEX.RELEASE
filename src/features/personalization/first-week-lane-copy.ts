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

const DAY_1_RETURN: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: 'study_return',
    primaryMessage: 'Return to your study block. No new systems yet — just the rhythm.',
    unlockExplanation: 'One completed study session earns a tiny preview of Study OS after the next block.',
  },
  game_like: {
    laneStageTheme: 'run_return',
    primaryMessage: 'Run it again. One more clean encounter before Run Board begins to form.',
    unlockExplanation: 'Complete this encounter and VEX will unlock a small progress proof.',
  },
  deep_creative: {
    laneStageTheme: 'project_return',
    primaryMessage: 'Return to your project block. VEX remembers where you left off.',
    unlockExplanation: 'After one more completed block, VEX can start preserving next moves.',
  },
  minimal_normal: {
    laneStageTheme: 'clean_return',
    primaryMessage: 'Same clean container. No extras — just presence.',
    unlockExplanation: 'After this session, a tiny Today Strip preview will appear.',
  },
};

const DAY_2_PROOF: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: 'study_proof',
    primaryMessage: 'Two study blocks down. VEX now tracks what you study.',
    unlockExplanation: 'Your study layer now has a tiny amount of signal — VEX starts organizing around your material.',
  },
  game_like: {
    laneStageTheme: 'run_proof',
    primaryMessage: 'Two encounters complete. VEX sees you show up.',
    unlockExplanation: 'Run Board progress is visible now — VEX confirms you are not a tourist.',
  },
  deep_creative: {
    laneStageTheme: 'project_proof',
    primaryMessage: 'Two project blocks. VEX now preserves continuity.',
    unlockExplanation: 'Next move tracking is live — VEX remembers what you were building.',
  },
  minimal_normal: {
    laneStageTheme: 'clean_proof',
    primaryMessage: 'Two clean sessions. VEX learns your rhythm without making noise.',
    unlockExplanation: 'Today Strip is now visible — VEX keeps it quiet and useful.',
  },
};

const DAY_3_COMPANION: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: 'study_companion_preview',
    primaryMessage: 'Three sessions. VEX now remembers your study patterns.',
    unlockExplanation: 'A small memory surface appears — VEX uses real session data, not guesswork.',
  },
  game_like: {
    laneStageTheme: 'run_companion_preview',
    primaryMessage: 'Three runs. VEX now sees your encounter rhythm.',
    unlockExplanation: 'The companion surface shows one real observation from your completed sessions.',
  },
  deep_creative: {
    laneStageTheme: 'project_companion_preview',
    primaryMessage: 'Three project blocks. VEX now tracks creative flow.',
    unlockExplanation: 'A continuity memory card appears — grounded in your actual project sessions.',
  },
  minimal_normal: {
    laneStageTheme: 'clean_companion_preview',
    primaryMessage: 'Three clean sessions. VEX notices your tempo.',
    unlockExplanation: 'A quiet observation card appears — one real pattern, not a generic guess.',
  },
};

const DAY_7_WEEKLY: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: 'study_weekly_intelligence',
    primaryMessage: 'Week one complete. VEX analyzed your study rhythm.',
    unlockExplanation: 'Based on seven study sessions, VEX recommends one adjustment to your Study OS setup.',
  },
  game_like: {
    laneStageTheme: 'run_weekly_intelligence',
    primaryMessage: 'Week one complete. VEX analyzed your encounter pattern.',
    unlockExplanation: 'Based on seven runs, VEX suggests one Run Board experiment to try next week.',
  },
  deep_creative: {
    laneStageTheme: 'project_weekly_intelligence',
    primaryMessage: 'Week one complete. VEX analyzed your creative flow.',
    unlockExplanation: 'Based on seven project blocks, VEX recommends one next-move refinement.',
  },
  minimal_normal: {
    laneStageTheme: 'clean_weekly_intelligence',
    primaryMessage: 'Week one complete. VEX analyzed your quiet rhythm.',
    unlockExplanation: 'Based on seven clean sessions, VEX suggests one Today Strip refinement.',
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
  isComeback = false,
): LaneCopy {
  const lane = laneProfile.primaryLane;
  if (stage === 'DAY_0_NOT_STARTED') return DAY_0[lane];
  if (isComeback) {
    return {
      laneStageTheme: `${lane}_comeback`,
      primaryMessage: fallbackMessage,
      unlockExplanation: PATH[lane],
    };
  }
  if (stage === 'DAY_1_RETURN') return DAY_1_RETURN[lane];
  if (stage === 'DAY_2_PROGRESS_PROOF') return DAY_2_PROOF[lane];
  if (stage === 'DAY_3_COMPANION_CONNECTION') return DAY_3_COMPANION[lane];
  const pathExplanation = PATH[lane];
  if (stage === 'DAY_5_PATH_FORMING') {
    return {
      laneStageTheme: `${lane}_path_forming`,
      primaryMessage: pathExplanation,
      unlockExplanation: pathExplanation,
    };
  }
  if (stage === 'DAY_7_DEEPER_MODE') return DAY_7_WEEKLY[lane];
  return {
    laneStageTheme: `${lane}_${stage.toLowerCase()}`,
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
