import type { BaseSessionCompletionEvent } from './base-event-types';

export interface SessionCompletedEvent extends BaseSessionCompletionEvent {
  type: 'session_completed';
  data: {
    completionType:
      | 'natural'
      | 'forced'
      | 'abandoned'
      | 'timeout'
      | 'achievement';
    completionTime: Date;
    duration: number;
    objectives: {
      total: number;
      completed: number;
      failed: number;
      skipped: number;
      percentage: number;
    };
    performance: {
      overallScore: number;
      accuracy: number;
      efficiency: number;
      speed: number;
      consistency: number;
    };
    conditions: {
      success: boolean;
      failureReason?: string;
      completionCriteria: string[];
      metCriteria: string[];
      missedCriteria: string[];
    };
  };
}

export interface SessionAbortedEvent extends BaseSessionCompletionEvent {
  type: 'session_aborted';
  data: {
    abortTime: Date;
    duration: number;
    progress: {
      percentage: number;
      objectivesCompleted: number;
      totalObjectives: number;
      currentPhase: string;
    };
    abortReason:
      | 'user_choice'
      | 'technical_error'
      | 'timeout'
      | 'emergency'
      | 'system_intervention';
    abortContext: { trigger: string; userState: string; systemState: string };
    recovery: { resumable: boolean; dataPreserved: boolean; penalty: unknown };
  };
}

export interface SessionTimeoutEvent extends BaseSessionCompletionEvent {
  type: 'session_timeout';
  data: {
    timeoutTime: Date;
    duration: number;
    timeLimit: number;
    progress: {
      percentage: number;
      objectivesCompleted: number;
      totalObjectives: number;
    };
    timeoutType: 'soft' | 'hard' | 'grace_period';
    consequences: {
      scorePenalty: number;
      rewardReduction: number;
      experienceLoss: number;
    };
    extension: {
      available: boolean;
      granted: boolean;
      duration?: number;
      cost?: unknown;
    };
  };
}
