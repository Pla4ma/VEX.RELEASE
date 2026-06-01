import { eventBus } from '../events';
import type { Experiment, ExperimentAssignment } from './ab-types';

export const experiments = new Map<string, Experiment>();
export const userAssignments = new Map<string, ExperimentAssignment[]>();

export function createExperiment(
  experimentData: Omit<Experiment, 'id' | 'startDate'>,
): Experiment {
  const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const experiment: Experiment = {
    ...experimentData,
    id,
    startDate: Date.now(),
  };
  experiments.set(id, experiment);
  eventBus.publish('experiment:created', { experiment });
  return experiment;
}

export function getExperiment(id: string): Experiment | undefined {
  return experiments.get(id);
}

export function getAllExperiments(): Experiment[] {
  return Array.from(experiments.values());
}

export function getActiveExperiments(): Experiment[] {
  return Array.from(experiments.values()).filter(
    (exp) => exp.status === 'RUNNING',
  );
}

export function completeExperiment(
  experimentId: string,
  winner?: string,
): void {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return;
  }
  experiment.status = 'COMPLETED';
  experiment.endDate = Date.now();
  eventBus.publish('experiment:completed', { experiment, winner });
}
