import { z } from 'zod';

export const FABActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  color: z.string().optional(),
  onPress: z.function().optional(),
  priority: z.number().min(0).max(100).default(50),
});

export const FABConfigSchema = z.object({
  actions: z.array(FABActionSchema),
  visible: z.boolean().default(true),
  animateOnEnter: z.boolean().default(true),
});
