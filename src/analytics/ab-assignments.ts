import { eventBus } from '../events';
import type { Variant } from './ab-types';
import {
  isUserEligibleForExperiment,
  selectVariant,
} from './ab-management-types';
import { experiments, userAssignments } from './ab-experiments-mgmt';

export function assignUserToExperiment(
  userId: string,
  experimentId: string,
  forceVariant?: string,
): ExperimentAssignment | null {
  const experiment = experiments.get(experimentId);
  if (!experiment || experiment.status !== 'RUNNING') {
    return null;
  }
  const existingAssignments = userAssignments.get(userId) || [];
  const existingAssignment = existingAssignments.find(
    (a) => a.experimentId === experimentId,
  );
  if (existingAssignment) {
    return existingAssignment;
  }
  if (!isUserEligibleForExperiment(userId, experiment)) {
    return null;
  }
  const variantId = forceVariant || selectVariant(userId, experiment);
  if (!variantId) {
    return null;
  }
  const assignment: ExperimentAssignment = {
    experimentId,
    variantId,
    assignedAt: Date.now(),
    userId,
  };
  userAssignments.set(userId, [...existingAssignments, assignment]);
  eventBus.publish('experiment:assigned', { assignment, experiment });
  return assignment;
}

export function getUserVariant(
  userId: string,
  experimentId: string,
): Variant | null {
  const assignments = userAssignments.get(userId) || [];
  const assignment = assignments.find((a) => a.experimentId === experimentId);
  if (!assignment) {
    return null;
  }
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }
  return experiment.controlVariant.id === assignment.variantId
    ? experiment.controlVariant
    : experiment.treatmentVariants.find((v) => v.id === assignment.variantId) ||
        null;
}

export function getVariantConfig<T = Record<string, unknown>>(
  userId: string,
  experimentId: string,
): T | null {
  const variant = getUserVariant(userId, experimentId);
  return (variant?.config as T) || null;
}

export function recordExperimentEvent(
  userId: string,
  experimentId: string,
  eventName: string,
  value?: number,
  properties?: Record<string, unknown>,
): void {
  const assignment = userAssignments
    .get(userId)
    ?.find((a) => a.experimentId === experimentId);
  if (!assignment) {
    return;
  }
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return;
  }
  eventBus.publish('experiment:event', {
    userId,
    experimentId,
    variantId: assignment.variantId,
    eventName,
    value,
    properties,
    timestamp: Date.now(),
  });
}

export function getUserExperiments(userId: string): ExperimentAssignment[] {
  return userAssignments.get(userId) || [];
}

export function removeUserFromExperiment(
  userId: string,
  experimentId: string,
): boolean {
  const assignments = userAssignments.get(userId) || [];
  const filtered = assignments.filter((a) => a.experimentId !== experimentId);
  if (filtered.length === assignments.length) {
    return false;
  }
  userAssignments.set(userId, filtered);
  eventBus.publish('experiment:unassigned', { userId, experimentId });
  return true;
}

export function clearUserAssignments(userId: string): void {
  userAssignments.delete(userId);
  eventBus.publish('experiment:assignments_cleared', { userId });
}
