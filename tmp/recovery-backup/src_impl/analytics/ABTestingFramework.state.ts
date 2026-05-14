import { 
  type Experiment, 
  type ExperimentAssignment, 
  type ExperimentResults 
} from './ABTestingFramework.types';

export const experiments = new Map<string, Experiment>();
export const userAssignments = new Map<string, ExperimentAssignment[]>();
export const experimentResults = new Map<string, ExperimentResults>();
