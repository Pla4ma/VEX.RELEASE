import { z } from 'zod';
import { XpSourceSchema } from './schemas-xp';

const ProgressionTimestampSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return Date.parse(value);
  }
  return value;
}, z.number());

export const ProgressionRowSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    level: z.number().min(1).default(1),
    xp: z.number().min(0).default(0),
    total_xp: z.number().min(0).default(0),
    next_level_threshold: z.number().positive(),
    last_level_up_at: ProgressionTimestampSchema.nullable().default(null),
    created_at: ProgressionTimestampSchema,
    updated_at: ProgressionTimestampSchema,
  })
  .passthrough();

export const XpEntryRowSchema = z
  .object({
    id: z.string().uuid(),
    amount: z.number().positive(),
    source: XpSourceSchema,
    session_id: z.string().uuid().nullable(),
    metadata: z.record(z.unknown()).nullable(),
    created_at: ProgressionTimestampSchema,
  })
  .passthrough();
