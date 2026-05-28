import { z } from "zod";

export const MemoryPanelItemSchema = z
  .object({
    id: z.string().min(1),
    observation: z.string().min(1),
    evidence: z.string().min(1),
    confidence: z.number().min(0).max(1),
    source: z.string().min(1),
    type: z.string().min(1),
    isHidden: z.boolean(),
    createdAt: z.number().int().min(0),
  })
  .strict();

export type MemoryPanelItem = z.infer<typeof MemoryPanelItemSchema>;

export const WHAT_VEX_LEARNED_MIN_SESSIONS = 3;

export interface MemoryPanelProps {
  items: MemoryPanelItem[];
  onHide: (id: string) => void;
  onAccept: (id: string) => void;
  isAccepting?: boolean;
  isHiding?: boolean;
}
