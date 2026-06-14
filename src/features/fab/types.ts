import type { z } from 'zod';
import { FABActionSchema } from './schemas';

export type FABAction = z.infer<typeof FABActionSchema>;

export interface FABConfig {
  actions: FABAction[];
  visible: boolean;
  animateOnEnter: boolean;
}
