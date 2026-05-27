import type { FeatureAccessMap } from "../../features/liveops-config/feature-access";

export const hiddenFeatureAccess: Partial<FeatureAccessMap> = {
  shop: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: "Shop not available",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_deactivated",
  },
  squads: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: "Squads not available",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_deactivated",
  },
  boss_tab: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: "Boss not available",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_deactivated",
  },
  ai_coach_advanced: {
    isUnlocked: false,
    isVisible: false,
    lockedDescription: "Advanced coach not available",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_deactivated",
  },
};

export const availableFeatureAccess: Partial<FeatureAccessMap> = {
  boss_tab: {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: "",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_core",
  },
  ai_coach_advanced: {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: "",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_core",
  },
  content_study: {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: "",
    recommendedUnlockMoment: "",
    unlockReason: "",
    releaseState: "final_release_core",
  },
};
