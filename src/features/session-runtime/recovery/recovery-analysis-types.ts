export interface RecoveryConfig {
  autoRecoveryEnabled: boolean;
  autoRecoveryDelay: number;
  streakProtectionEnabled: boolean;
  partialCreditThreshold: number;
  maxRecoveriesPerSession: number;
}
