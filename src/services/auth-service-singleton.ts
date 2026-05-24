import { AuthService } from "./auth";

let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

export function resetAuthService(): void {
  authServiceInstance = null;
}
