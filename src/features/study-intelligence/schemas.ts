import { z } from 'zod';

export const WeakTopicSchema = z
  .object({
    topic: z.string().min(1),
    confidence: z.enum(['weak', 'medium', 'strong']),
    reviewCount: z.number().int().min(0),
    lastReviewedAt: z.number().int().min(0).nullable(),
    suggestedAction: z.string().min(1),
  })
  .strict();

export const WeeklyIntelligenceSchema = z
  .object({
    generatedAt: z.number().int().min(0),
    totalStudyMinutes: z.number().int().min(0),
    completedBlocks: z.number().int().min(0),
    reviewItemsDue: z.number().int().min(0),
    weakTopics: z.array(WeakTopicSchema),
    streakDays: z.number().int().min(0),
    suggestion: z.string().min(1),
  })
  .strict();

export type WeakTopic = z.infer<typeof WeakTopicSchema>;
export type WeeklyIntelligence = z.infer<typeof WeeklyIntelligenceSchema>;
