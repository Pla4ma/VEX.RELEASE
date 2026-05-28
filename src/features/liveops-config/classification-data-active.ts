import type { FeatureClassificationEntry } from "./final-release-classification";
import { SESSION_FEATURES } from "./classification-session-features";
import { HOME_FEATURES } from "./classification-home-features";
import { PROGRESSION_FEATURES } from "./classification-progression-features";

export const ACTIVE: FeatureClassificationEntry[] = [
  ...SESSION_FEATURES,
  ...HOME_FEATURES,
  ...PROGRESSION_FEATURES,
];
