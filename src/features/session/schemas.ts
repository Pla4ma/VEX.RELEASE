import { z } from 'zod';
import { SessionModeSchema } from '../../session/modes';

export { SessionMode } from '../../session/modes';

export const SessionStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'PAUSED',
  'DEGRADED',
  'COMPLETED',
  'ABANDONED',
  'RECOVERING',
]);

export const SessionPhaseSchema = z.enum([
  'IDLE',
  'PREPARING',
  'FOCUSING',
  'RESTING',
  'REFLECTING',
  'COMPLETING',
]);

export const TimerStateSchema = z.object({
  elapsedSeconds: z.number().min(0),
  remainingSeconds: z.number().min(0),
  totalSeconds: z.number().min(1),
  isRunning: z.boolean(),
  lastTickAt: z.number().optional(),
});

export const SessionPuritySchema = z.object({
  score: z.number().min(0).max(100),
  label: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL']),
  pauseCount: z.number().min(0),
  totalPauseSeconds: z.number().min(0),
  backgroundTimeSeconds: z.number().min(0),
  focusInterruptions: z.number().min(0),
});

export const SessionViewModelSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    status: SessionStatusSchema,
    phase: SessionPhaseSchema,
    mode: SessionModeSchema,
    timer: TimerStateSchema,
    purity: SessionPuritySchema,
    startedAt: z.number(),
    expectedDurationSeconds: z.number(),
    canPause: z.boolean(),
    canComplete: z.boolean(),
    canAbandon: z.boolean(),
    isOffline: z.boolean(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;
export type TimerState = z.infer<typeof TimerStateSchema>;
export type SessionPurity = z.infer<typeof SessionPuritySchema>;
export type SessionViewModel = z.infer<typeof SessionViewModelSchema>;
