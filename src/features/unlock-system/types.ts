import { z } from 'zod';
import { SignalTypeSchema, CompositeScoreSchema, FeatureUnlockStateSchema } from './schemas';

export type SignalType = z.infer<typeof SignalTypeSchema>;
export type CompositeScore = z.infer<typeof CompositeScoreSchema>;
export type FeatureUnlockState = z.infer<typeof FeatureUnlockStateSchema>;

export type UnlockSignal = {
  type: SignalType;
  value: number;
  weight: number;
  timestamp: string;
};

export interface MultiSignalUnlockEngine {
  computeScore: (signals: UnlockSignal[]) => CompositeScore;
  checkFeatureUnlock: (featureId: string, score: CompositeScore) => FeatureUnlockState;
  getEffectiveThreshold: (featureId: string, lane: string | null) => number;
}
