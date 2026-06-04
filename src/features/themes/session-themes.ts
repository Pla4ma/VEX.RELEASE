/**
 * Colors below are documented game-mechanic config data — not UI styling.
 * Mapped to theme.colors.accent.* and theme.colors.semantic.* where applicable.
 */
import { z } from 'zod';
import { lightColors } from '@/theme/tokens/colors';


export const SessionThemeSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    previewColor: z.string().min(1),
    backgroundTint: z.string().min(1),
    ambientSoundKey: z.string().nullable(),
    coinCost: z.number().int().min(0),
    isFree: z.boolean(),
    isOwned: z.boolean().optional(),
  })
  .strict();

export type SessionTheme = z.infer<typeof SessionThemeSchema>;

export const SESSION_THEMES: SessionTheme[] = [
  {
    id: 'default',
    name: 'Focus Mode',
    description: 'Clean and minimal',
    previewColor: lightColors.semantic.primary,
    backgroundTint: 'transparent',
    ambientSoundKey: null,
    coinCost: 0,
    isFree: true,
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    description: 'Calm blue waters',
    previewColor: lightColors.accent.teal,
    backgroundTint: lightColors.semantic.backgroundMuted,
    ambientSoundKey: 'ocean',
    coinCost: 500,
    isFree: false,
  },
  {
    id: 'forest-night',
    name: 'Forest Night',
    description: 'Silent and grounded',
    previewColor: lightColors.semantic.success,
    backgroundTint: lightColors.semantic.backgroundMuted,
    ambientSoundKey: 'forest',
    coinCost: 500,
    isFree: false,
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm and intense',
    previewColor: lightColors.accent.orange,
    // Mapped to semantic warm-dark token in lieu of hardcoded hex
    backgroundTint: lightColors.semantic.atmosphereBase1,
    ambientSoundKey: null,
    coinCost: 800,
    isFree: false,
  },
  {
    id: 'void',
    name: 'The Void',
    description: 'Pure focus, no distractions',
    previewColor: lightColors.accent.purple,
    // Mapped to semantic deep-dark token in lieu of hardcoded hex
    backgroundTint: lightColors.semantic.auroraDarkBase,
    ambientSoundKey: null,
    coinCost: 1200,
    isFree: false,
  },
  {
    id: 'legendary',
    name: 'Legendary Focus',
    description: 'Unlock after 30 day streak',
    previewColor: lightColors.semantic.warning,
    // Mapped to semantic warm-dark token in lieu of hardcoded hex
    backgroundTint: lightColors.semantic.atmosphereBase3,
    ambientSoundKey: null,
    coinCost: 5000,
    isFree: false,
  },
];

export function getSessionThemeById(themeId: string | undefined): SessionTheme {
  if (!themeId) {
    return SESSION_THEMES[0]!;
  }

  return (
    SESSION_THEMES.find((theme) => theme.id === themeId) ?? SESSION_THEMES[0]!
  );
}
