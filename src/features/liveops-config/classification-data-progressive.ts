import type { FeatureClassificationEntry } from './final-release-classification';
import { PROGRESSIVE_EARLY } from './classification-data-progressive-early';
import { PROGRESSIVE_ADVANCED } from './classification-data-progressive-advanced';

export { PROGRESSIVE_EARLY, PROGRESSIVE_ADVANCED };

export const PROGRESSIVE: FeatureClassificationEntry[] = [
  ...PROGRESSIVE_EARLY,
  ...PROGRESSIVE_ADVANCED,
];
