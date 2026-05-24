import { CompanionService } from './service';
import type { CompanionState } from './types';

let activeCompanionService: CompanionService | null = null;

export function getCompanionService(state?: CompanionState): CompanionService {
  if (!activeCompanionService || state) {
    activeCompanionService = new CompanionService(state);
  }
  return activeCompanionService;
}

export function clearCompanionService(): void {
  activeCompanionService = null;
}
