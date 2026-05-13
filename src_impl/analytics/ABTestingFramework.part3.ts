import { eventBus } from "../events";


export function getActiveExperiments(): Experiment[] {
  return Array.from(experiments.values()).filter((e) => e.status === 'RUNNING');
}

export function getUserExperiments(userId: string): ExperimentAssignment[] {
  return userAssignments.get(userId) || [];
}