import { captureSilentFailure } from "../../../utils/silent-failure";
import { getStorage, STORAGE_KEYS } from "./storage-config";

export class OfflineManager {
  private static instance: OfflineManager;
  private isOfflineMode = false;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  static resetForTests(): void {
    OfflineManager.instance = new OfflineManager();
  }

  async setOfflineMode(enabled: boolean): Promise<void> {
    this.isOfflineMode = enabled;
    await getStorage().setItem(
      STORAGE_KEYS.OFFLINE_MODE,
      JSON.stringify(enabled),
    );
  }

  async isInOfflineMode(): Promise<boolean> {
    try {
      const data = await getStorage().getItem(STORAGE_KEYS.OFFLINE_MODE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      captureSilentFailure(error, {
        feature: "content-study",
        operation: "safe-fallback",
        type: "data",
      });
      return false;
    }
  }

  getOfflineModeSync(): boolean {
    return this.isOfflineMode;
  }

  async canPerformAction(
    _action: "submit" | "generate" | "feedback",
  ): Promise<boolean> {
    const offline = await this.isInOfflineMode();
    if (!offline) return true;
    return true;
  }
}
