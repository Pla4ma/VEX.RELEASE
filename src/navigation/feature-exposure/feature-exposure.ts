import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
  type FeatureAccessMap,
} from '../../features/liveops-config';

export interface ExposureInputs {
  isFlagEnabled?: boolean;
  isLiveopsUnlocked: boolean;
  isLiveopsVisible: boolean;
}

export function canExposeFeature({
  isFlagEnabled,
  isLiveopsUnlocked,
  isLiveopsVisible,
}: ExposureInputs): boolean {
  const flagPass = isFlagEnabled ?? true;
  return flagPass && isLiveopsVisible && isLiveopsUnlocked;
}

export interface RootExposureFlags {
  advanced: boolean;
  battlePass: boolean;
  boss: boolean;
  challenges: boolean;
  coach: boolean;
  companion: boolean;
  guild: boolean;
  inventory: boolean;
  mastery: boolean;
  monthly: boolean;
  shop: boolean;
  study: boolean;
  vault: boolean;
}

interface BuildRootExposureParams {
  features: FeatureAccessMap;
  isEnabled: (key: string) => boolean;
}

export function buildRootExposureFlags({
  features,
  isEnabled: _isEnabled,
}: BuildRootExposureParams): RootExposureFlags {
  const resolve = (featureKey: keyof FeatureAccessMap): boolean => {
    const availability = getFeatureAvailability(features[featureKey]);
    return isFeatureAvailableForNavigation(availability);
  };

  return {
    advanced: false,
    battlePass: false,
    boss: resolve('boss_tab'),
    challenges: resolve('challenges'),
    coach: resolve('ai_coach_advanced'),
    companion: resolve('companion_detail'),
    guild: false,
    inventory: false,
    mastery: resolve('achievements'),
    monthly: false,
    shop: false,
    study: resolve('content_study'),
    vault: false,
  };
}

export default canExposeFeature;
