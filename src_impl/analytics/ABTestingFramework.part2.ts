import { eventBus } from "../events";


export function createExperiment(experimentData: Omit<Experiment, 'id' | 'startDate'>): Experiment {
  const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const experiment: Experiment = {
    ...experimentData,
    id,
    startDate: Date.now(),
  };

  experiments.set(id, experiment);

  eventBus.publish('experiment:created', {
    experimentId: id,
    name: experiment.name,
    type: experiment.type,
  });

  return experiment;
}

export function getExperiment(id: string): Experiment | null {
  return experiments.get(id) || null;
}

export function assignUserToExperiment(
  userId: string,
  experimentId: string,
  userProfile: {
    sessions: number;
    isPremium: boolean;
    platform: 'ios' | 'android' | 'web';
    segment: string;
  },
): string | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }
  if (experiment.status !== 'RUNNING') {
    return null;
  }

  // Check targeting
  if (!isUserEligible(experiment, userProfile)) {
    return null;
  }

  // Check if already assigned
  const userExps = userAssignments.get(userId) || [];
  const existing = userExps.find((a) => a.experimentId === experimentId);
  if (existing) {
    return existing.variantId;
  }

  // Assign based on traffic allocation
  const variantId = selectVariant(experiment.trafficAllocation);
  if (!variantId) {
    return null;
  }

  const assignment: ExperimentAssignment = {
    experimentId,
    variantId,
    assignedAt: Date.now(),
    userId,
  };

  userExps.push(assignment);
  userAssignments.set(userId, userExps);

  eventBus.publish('experiment:assigned', {
    userId,
    experimentId,
    variantId,
  });

  return variantId;
}

export function getUserVariant(userId: string, experimentId: string): string | null {
  const userExps = userAssignments.get(userId) || [];
  const assignment = userExps.find((a) => a.experimentId === experimentId);
  return assignment?.variantId || null;
}

export function getVariantConfig(userId: string, experimentId: string): Record<string, unknown> | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  const variantId = getUserVariant(userId, experimentId);
  if (!variantId) {
    return null;
  }

  if (variantId === experiment.controlVariant.id) {
    return experiment.controlVariant.config;
  }

  const variant = experiment.treatmentVariants.find((v) => v.id === variantId);
  return variant?.config || null;
}

export function recordExperimentEvent(userId: string, experimentId: string, event: { metric: string; value: number }): void {
  const userVariant = getUserVariant(userId, experimentId);
  if (userVariant) {
    eventBus.publish('experiment:event', {
      userId,
      experimentId,
      variantId: userVariant,
      eventName: event.metric,
      value: event.value,
    });
  }
}

export function calculateResults(experimentId: string): ExperimentResults | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  // In real implementation, this would query aggregated metrics
  // For now, return placeholder structure

  const results: ExperimentResults = {
    experimentId,
    experimentName: experiment.name,
    status: experiment.status,
    startDate: experiment.startDate,
    endDate: experiment.endDate,
    totalParticipants: 0,
    variants: [],
    confidence: 0,
    recommendedAction: 'CONTINUE',
  };

  experimentResults.set(experimentId, results);
  return results;
}

export function completeExperiment(experimentId: string, winnerVariantId?: string): ExperimentResults | null {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return null;
  }

  experiment.status = 'COMPLETED';
  experiment.endDate = Date.now();

  const results = calculateResults(experimentId);
  if (results && winnerVariantId) {
    results.winner = winnerVariantId;
    results.recommendedAction = 'IMPLEMENT_WINNER';
  }

  if (winnerVariantId && results) {
    eventBus.publish('experiment:completed', {
      experimentId,
      winner: winnerVariantId,
      results,
    });
  }

  return results;
}