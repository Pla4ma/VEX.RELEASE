import { PresetService } from './preset-manager';

let presetServiceInstance: PresetService | null = null;

export function getPresetService(userId?: string): PresetService {
  if (!presetServiceInstance) {
    presetServiceInstance = new PresetService(userId);
  } else if (userId) {
    presetServiceInstance.setUserId(userId);
  }
  return presetServiceInstance;
}
