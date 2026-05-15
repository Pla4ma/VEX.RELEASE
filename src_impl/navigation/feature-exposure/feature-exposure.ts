import { FEATURE_FLAGS } from '../../constants/features';
import type { FeatureAccessMap } from '../../features/liveops-config';

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
  isEnabled,
}: BuildRootExposureParams): RootExposureFlags {
  return {
    advanced: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.ANALYTICS),
      isLiveopsUnlocked: features.advanced_settings.isUnlocked,
      isLiveopsVisible: features.advanced_settings.isVisible,
    }),
    battlePass: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.SEASON_PASS),
      isLiveopsUnlocked: features.battle_pass.isUnlocked,
      isLiveopsVisible: features.battle_pass.isVisible,
    }),
    boss: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.BASIC_SOLO_BOSS),
      isLiveopsUnlocked: features.boss_tab.isUnlocked,
      isLiveopsVisible: features.boss_tab.isVisible,
    }),
    challenges: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.BASIC_CHALLENGES),
      isLiveopsUnlocked: features.challenges.isUnlocked,
      isLiveopsVisible: features.challenges.isVisible,
    }),
    coach: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.AI_COACH_BASICS),
      isLiveopsUnlocked: features.ai_coach_advanced.isUnlocked,
      isLiveopsVisible: features.ai_coach_advanced.isVisible,
    }),
    companion: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.COMPANION),
      isLiveopsUnlocked: features.companion_detail.isUnlocked,
      isLiveopsVisible: features.companion_detail.isVisible,
    }),
    guild: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.SQUADS_ACCOUNTABILITY),
      isLiveopsUnlocked: features.squads.isUnlocked,
      isLiveopsVisible: features.squads.isVisible,
    }),
    inventory: canExposeFeature({
      isLiveopsUnlocked: features.inventory.isUnlocked,
      isLiveopsVisible: features.inventory.isVisible,
    }),
    mastery: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.ACHIEVEMENTS),
      isLiveopsUnlocked: features.achievements.isUnlocked,
      isLiveopsVisible: features.achievements.isVisible,
    }),
    monthly: canExposeFeature({
      isFlagEnabled: isEnabled(FEATURE_FLAGS.MONTHLY_REPORT),
      isLiveopsUnlocked: features.seasonal_features.isUnlocked,
      isLiveopsVisible: features.seasonal_features.isVisible,
    }),
    shop: canExposeFeature({
      isLiveopsUnlocked: features.shop.isUnlocked,
      isLiveopsVisible: features.shop.isVisible,
    }),
    study: canExposeFeature({
      isLiveopsUnlocked: features.content_study.isUnlocked,
      isLiveopsVisible: features.content_study.isVisible,
    }),
    vault: canExposeFeature({
      isLiveopsUnlocked: features.economy_advanced.isUnlocked,
      isLiveopsVisible: features.economy_advanced.isVisible,
    }),
  };
}

export default canExposeFeature;
