import type { z } from 'zod';
import type { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';
import {
  DurationBucketSchema,
  PersonalBestCandidateSchema,
  PersonalBestComparisonSchema,
  PersonalBestKeySchema,
  PersonalBestRowSchema,
  PersonalBestSchema,
} from './schemas';

export type DurationBucket = z.infer<typeof DurationBucketSchema>;
export type PersonalBestKey = z.infer<typeof PersonalBestKeySchema>;
export type PersonalBest = z.infer<typeof PersonalBestSchema>;
export type PersonalBestComparison = z.infer<typeof PersonalBestComparisonSchema>;
export type PersonalBestCandidate = z.infer<typeof PersonalBestCandidateSchema>;
export type PersonalBestRow = z.infer<typeof PersonalBestRowSchema>;
export type PersonalBestTableRow = Tables<'personal_bests'>;
export type PersonalBestTableInsert = TablesInsert<'personal_bests'>;
export type PersonalBestTableUpdate = TablesUpdate<'personal_bests'>;
