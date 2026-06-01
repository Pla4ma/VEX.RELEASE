import { z } from 'zod';

export const AccountDeletionInputSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const AccountDeletionResultSchema = z
  .object({
    userId: z.string().uuid(),
    deletedAt: z.number().int().positive(),
    localStorageCleared: z.boolean(),
    secureStorageCleared: z.boolean(),
    monetizationSignedOut: z.boolean(),
  })
  .strict();

export type AccountDeletionInput = z.infer<typeof AccountDeletionInputSchema>;
export type AccountDeletionResult = z.infer<typeof AccountDeletionResultSchema>;
