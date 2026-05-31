import type { BaseSessionCompletionEvent } from './base-event-types';

export interface SessionSystemMaintenanceEvent
  extends BaseSessionCompletionEvent {
  type: 'session_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    affectedServices: string[];
    impact: {
      completion: boolean;
      rewards: boolean;
      analytics: boolean;
      achievements: boolean;
    };
    message: string;
    initiatedBy: string;
  };
}

export interface SessionSystemErrorEvent extends BaseSessionCompletionEvent {
  type: 'session_system_error';
  data: {
    errorType:
      | 'completion_error'
      | 'reward_error'
      | 'analytics_error'
      | 'system_error';
    errorCode: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: {
      service: string;
      operation: string;
      userId: string;
      sessionId: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
    compensation: { type: string; amount: number; description: string };
  };
}
