import type { z } from 'zod';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';
import {
  CompletionStatusSchema,
  CreateFocusContractRepositoryInputSchema,
  FocusContractInputSchema,
  FocusContractReflectionInputSchema,
  FocusContractRowSchema,
  FocusContractSchema,
  ReflectionStatusSchema,
} from './schemas';

export type CompletionStatus = z.infer<typeof CompletionStatusSchema>;
export type ReflectionStatus = z.infer<typeof ReflectionStatusSchema>;
export type FocusContract = z.infer<typeof FocusContractSchema>;
export type FocusContractInput = z.infer<typeof FocusContractInputSchema>;
export type FocusContractReflectionInput = z.infer<
  typeof FocusContractReflectionInputSchema
>;
export type CreateFocusContractRepositoryInput = z.infer<
  typeof CreateFocusContractRepositoryInputSchema
>;
export type FocusContractRow = z.infer<typeof FocusContractRowSchema>;
export type FocusContractTableRow = Tables<'focus_contracts'>;
export type FocusContractTableInsert = TablesInsert<'focus_contracts'>;
export type FocusContractTableUpdate = TablesUpdate<'focus_contracts'>;
