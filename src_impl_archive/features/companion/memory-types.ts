import type { z } from 'zod';
import type { Tables, TablesInsert } from '../../types/supabase';
import type {
  CheckSessionMemoriesInputSchema,
  CompanionMemoryCreateSchema,
  CompanionMemoryRowSchema,
  CompanionMemorySchema,
  CompanionMemoryTypeSchema,
  MemoryContextSchema,
  MemorySessionInputSchema,
} from './memory-schemas';

export type CompanionMemoryType = z.infer<typeof CompanionMemoryTypeSchema>;
export type CompanionMemory = z.infer<typeof CompanionMemorySchema>;
export type CompanionMemoryCreate = z.infer<typeof CompanionMemoryCreateSchema>;
export type CompanionMemoryRow = z.infer<typeof CompanionMemoryRowSchema>;
export type MemoryContext = z.infer<typeof MemoryContextSchema>;
export type MemorySessionInput = z.infer<typeof MemorySessionInputSchema>;
export type CheckSessionMemoriesInput = z.infer<typeof CheckSessionMemoriesInputSchema>;
export type CompanionMemoryTableRow = Tables<'companion_memories'>;
export type CompanionMemoryTableInsert = TablesInsert<'companion_memories'>;
