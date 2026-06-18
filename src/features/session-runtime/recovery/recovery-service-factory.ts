import type { RecoveryConfig } from './recovery-analysis';
import { RecoveryService } from './RecoveryService';

export function createRecoveryService(
  config?: Partial<RecoveryConfig>,
): RecoveryService {
  return new RecoveryService(config);
}

let serviceInstance: RecoveryService | null = null;
export function getRecoveryService(
  config?: Partial<RecoveryConfig>,
): RecoveryService {
  if (!serviceInstance) {
    serviceInstance = new RecoveryService(config);
  }
  return serviceInstance;
}
