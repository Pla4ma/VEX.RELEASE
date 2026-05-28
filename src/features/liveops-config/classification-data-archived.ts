import type { FeatureClassificationEntry } from "./final-release-classification";
import { ARCHIVED_ECONOMY } from "./archived-economy";
import { ARCHIVED_SOCIAL_COMPETITIVE } from "./archived-social-competitive";
import { ARCHIVED_RETENTION } from "./archived-retention";

export const ARCHIVED: FeatureClassificationEntry[] = [
  ...ARCHIVED_ECONOMY,
  ...ARCHIVED_SOCIAL_COMPETITIVE,
  ...ARCHIVED_RETENTION,
];
