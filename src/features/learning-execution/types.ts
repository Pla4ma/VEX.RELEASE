import { z } from 'zod';
import type {
  ContentStudyGateInputSchema,
  ContentStudyGateSchema,
  LearningExecutionCopySchema,
  LearningExecutionLayerSchema,
  LearningExecutionPersonaSchema,
  LearningSessionTargetSchema,
} from './schemas';

export type ContentStudyGate = z.infer<typeof ContentStudyGateSchema>;
export type ContentStudyGateInput = z.infer<typeof ContentStudyGateInputSchema>;
export type LearningExecutionCopy = z.infer<typeof LearningExecutionCopySchema>;
export type LearningExecutionLayer = z.infer<
  typeof LearningExecutionLayerSchema
>;
export type LearningExecutionPersona = z.infer<
  typeof LearningExecutionPersonaSchema
>;
export type LearningSessionTarget = z.infer<typeof LearningSessionTargetSchema>;
