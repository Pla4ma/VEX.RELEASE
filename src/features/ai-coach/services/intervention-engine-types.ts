// ─── Engine Configuration ───

export interface EngineConfig {
  maxConcurrentExecutions: number;
  defaultCooldownHours: number;
  maxInterventionsPerDay: number;
  enableRuleChaining: boolean;
  priorityThreshold: number;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  maxConcurrentExecutions: 3,
  defaultCooldownHours: 4,
  maxInterventionsPerDay: 5,
  enableRuleChaining: true,
  priorityThreshold: 7,
};

// ─── Error Classes ───

export class InterventionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InterventionError';
  }
}

export class DailyLimitExceededError extends InterventionError {
  constructor(message: string) {
    super(message);
    this.name = 'DailyLimitExceededError';
  }
}

export class InterventionSuppressedError extends InterventionError {
  constructor(message: string) {
    super(message);
    this.name = 'InterventionSuppressedError';
  }
}

export class ExecutionSlotUnavailableError extends InterventionError {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionSlotUnavailableError';
  }
}
