/**
 * Colors below are documented game-mechanic config data — not UI styling.
 * Mapped to theme.colors.accent.* and theme.colors.semantic.* where applicable.
 */
import { z } from "zod";
import { launchColors } from "@theme/tokens/launch-colors";

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
    id: "default",
    name: "Focus Mode",
    description: "Clean and minimal",
    previewColor: launchColors.hex_6366f1,
    backgroundTint: "transparent",
    ambientSoundKey: null,
    coinCost: 0,
    isFree: true,
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    description: "Calm blue waters",
    previewColor: launchColors.hex_0ea5e9,
    backgroundTint: launchColors.hex_0c1929,
    ambientSoundKey: "ocean",
    coinCost: 500,
    isFree: false,
  },
  {
    id: "forest-night",
    name: "Forest Night",
    description: "Silent and grounded",
    previewColor: launchColors.hex_22c55e,
    backgroundTint: launchColors.hex_0d1f12,
    ambientSoundKey: "forest",
    coinCost: 500,
    isFree: false,
  },
  {
    id: "ember",
    name: "Ember",
    description: "Warm and intense",
    previewColor: launchColors.hex_f97316,
    backgroundTint: launchColors.hex_1f0d06,
    ambientSoundKey: null,
    coinCost: 800,
    isFree: false,
  },
  {
    id: "void",
    name: "The Void",
    description: "Pure focus, no distractions",
    previewColor: launchColors.hex_a855f7,
    backgroundTint: launchColors.hex_0a0010,
    ambientSoundKey: null,
    coinCost: 1200,
    isFree: false,
  },
  {
    id: "legendary",
    name: "Legendary Focus",
    description: "Unlock after 30 day streak",
    previewColor: launchColors.hex_fbbf24,
    backgroundTint: launchColors.hex_1a1000,
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
