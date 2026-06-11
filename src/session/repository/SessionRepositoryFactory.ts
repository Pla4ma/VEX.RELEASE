import { SessionRepository } from './SessionRepository';

let repositoryInstance: SessionRepository | null = null;

export function getSessionRepository(userId?: string): SessionRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SessionRepository(userId);
  } else if (userId) {
    repositoryInstance.setUserId(userId);
  }
  return repositoryInstance;
}

export function resetSessionRepository(): void {
  repositoryInstance = null;
}