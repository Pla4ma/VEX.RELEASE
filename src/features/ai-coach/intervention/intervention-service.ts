export type {
  InterventionScenario,
  InterventionMessage,
  InterventionAction,
  BurnoutInput,
  PlateauInput,
  StreakRescueInput,
  BossStrategyInput,
  BossStrategy,
  StudyBehindInput,
  BossOpportunityInput,
  MomentumBuildingInput,
  ComebackReadyInput,
  StudyPlanCompleteInput,
  StudyStuckInput,
  DistractionDetectedInput,
  OptimalBreakInput,
  CoachPersona,
} from './intervention-types';

export {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
} from './intervention-detectors-core';

export {
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
  detectStudyBehind,
  detectBossOpportunity,
  detectMomentumBuilding,
  detectComebackReady,
  detectStudyPlanComplete,
} from './intervention-detectors-situational';

export {
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
} from './intervention-messages';

export { evaluateInterventions } from './evaluate-interventions';

import {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
} from './intervention-detectors-core';
import {
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
} from './intervention-detectors-situational';
import { evaluateInterventions } from './evaluate-interventions';
import {
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
} from './intervention-messages';

export {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
  evaluateInterventions,
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
};
