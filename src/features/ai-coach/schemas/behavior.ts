import { z } from 'zod';
import { SignalTypeSchema } from './enums';

export const BehaviorSignalSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    signalType: SignalTypeSchema,
    value: z.number(),
    confidence: z.number().min(0).max(1),
    timestamp: z.number().int().positive(),
    metadata: z.record(z.string(), z.unknown()),
    expiresAt: z.number().int().positive(),
  })
  .strict();

export const BehaviorProfileSchema = z
  .object({
    userId: z.string().uuid(),
    signals: z.array(BehaviorSignalSchema).max(50),
    lastUpdated: z.number().int().positive(),
    confidenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    coldStart: z.boolean(),
    dataPoints: z.number().int().min(0),
  })
  .strict();

// --- Inferred types ---

export type BehaviorSignal = z.infer<typeof BehaviorSignalSchema>;
export type BehaviorProfile = z.infer<typeof BehaviorProfileSchema>;
