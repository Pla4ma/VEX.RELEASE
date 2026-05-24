import { z } from 'zod';

import type { SquadSummary } from '../schemas';

export const createSquadSchema = z.object({
  name: z.string().trim().min(3, 'Squad names need at least 3 characters.').max(50),
  elementId: z.enum(['FLAME', 'VOID_SPARK', 'IRON', 'STORM', 'VOID_GEM', 'PULSE']),
  squadType: z.enum(['STUDY', 'WORK', 'GAMING', 'FITNESS', 'GENERAL']),
});

export const ELEMENTS = [
  { id: 'FLAME', label: 'FLAME', emoji: '🔥', hue: 10 },
  { id: 'VOID_SPARK', label: 'VOID', emoji: '⚡', hue: 52 },
  { id: 'IRON', label: 'IRON', emoji: '🛡️', hue: 205 },
  { id: 'STORM', label: 'STORM', emoji: '🌪️', hue: 192 },
  { id: 'VOID_GEM', label: 'VOID', emoji: '💎', hue: 272 },
  { id: 'PULSE', label: 'PULSE', emoji: '👑', hue: 328 },
] as const;

export const SQUAD_TYPES = ['STUDY', 'WORK', 'GAMING', 'FITNESS', 'GENERAL'] as const;

export type ElementId = (typeof ELEMENTS)[number]['id'];
export type SquadType = (typeof SQUAD_TYPES)[number];

export function buildPreviewSquad(name: string, hue: number): SquadSummary {
  const hex = hue.toString(16).padStart(6, '0').slice(0, 6);
  return {
    id: `${hex}0000-0000-0000-0000-000000000000`,
    name: name.trim() || 'New Squad',
    avatarUrl: null,
    memberCount: 1,
    maxMembers: 10,
    focusMultiplier: 1,
    synergyLevel: 1,
    isPublic: true,
    isMember: true,
    userRole: 'FOUNDER',
  };
}

export function toCreatedSquadSummary(squad: {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberCount: number;
  maxMembers: number;
  focusMultiplier: number;
  synergyLevel: number;
  isPublic: boolean;
}): SquadSummary {
  return { ...squad, isMember: true, userRole: 'FOUNDER' };
}
