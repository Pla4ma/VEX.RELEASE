import { z } from 'zod';

export const SquadSessionStatusSchema = z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']);

export const CreateSquadInputSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).nullable().optional(),
  maxMembers: z.number().int().min(2).max(20).optional(),
});

export const CreateSquadSessionInputSchema = z.object({
  squadId: z.string().uuid(),
  name: z.string().min(1).max(100),
  durationMinutes: z.number().int().min(10).max(120),
});

export type SquadSessionStatus = z.infer<typeof SquadSessionStatusSchema>;
export type CreateSquadInput = z.infer<typeof CreateSquadInputSchema>;
export type CreateSquadSessionInput = z.infer<typeof CreateSquadSessionInputSchema>;
