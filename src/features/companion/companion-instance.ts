import { CompanionService } from './service';
import type { CompanionState } from './types';

let companionServiceInstance: CompanionService | null = null;

export function getCompanionService(initialState?: CompanionState): CompanionService {
  if (!companionServiceInstance) {
    companionServiceInstance = new CompanionService(initialState);
  }
  return companionServiceInstance;
}

export function resetCompanionService(): void {
  companionServiceInstance = null;
}
