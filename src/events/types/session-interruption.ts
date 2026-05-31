export interface SessionInterruptionEventDefinitions {
  'session:interruption': {
    sessionId: string;
    interruption: unknown;
    userId: string;
  };
  'session:interruption:risk': {
    sessionId: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timeUntilRisk: number;
    userId: string;
  };
  'session:backgrounded': {
    sessionId: string;
    userId: string;
    backgroundedAt: number;
  };
  'session:foregrounded': {
    sessionId: string;
    userId: string;
    foregroundedAt: number;
    duration: number;
  };
  'session:recovery:attempted': {
    sessionId: string;
    recovery: unknown;
    userId: string;
  };
  'session:recovery:successful': {
    sessionId: string;
    userId: string;
    recoveredAt: number;
    recoveredTime: number;
  };
  'session:recovery:failed': {
    sessionId: string;
    userId: string;
    failedAt: number;
    reason: string;
  };
  'session:sync:started': {
    sessionId: string;
    userId: string;
    timestamp: number;
  };
  'session:sync:completed': {
    sessionId: string;
    userId: string;
    timestamp: number;
  };
  'session:sync:failed': {
    sessionId: string;
    userId: string;
    error: string;
    timestamp: number;
    willRetry: boolean;
  };
  'sync:operation_failed': {
    operation: {
      id: string;
      type: string;
      payload: Record<string, unknown>;
      createdAt: number;
      retryCount: number;
      maxRetries: number;
    };
    timestamp: number;
  };
  'session:conflict:detected': {
    sessionId: string;
    userId: string;
    localState: unknown;
    remoteState: unknown;
  };
  'session:conflict:resolved': {
    sessionId: string;
    userId: string;
    resolution: 'LOCAL' | 'REMOTE' | 'MERGED';
    timestamp: number;
  };
}
