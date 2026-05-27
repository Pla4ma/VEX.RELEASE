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
} from "./intervention-types";

export {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
  detectStudyBehind,
  detectBossOpportunity,
  detectMomentumBuilding,
  detectComebackReady,
  detectStudyPlanComplete,
} from "./intervention-detectors";

export {
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
} from "./intervention-messages";

export { evaluateInterventions } from "./evaluate-interventions";

import {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
} from "./intervention-detectors";
import { evaluateInterventions } from "./evaluate-interventions";
import {
  generateBurnoutMessage,
  generatePlateauMessage,
  generateStreakRescueMessage,
  generateBossStrategyMessage,
} from "./intervention-messages";

export default {
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
