import type { SessionPreset } from "../types";
import { ValidateSessionPresetSchema } from "../validation/schemas";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("session:presets:io");

export function buildExportPresets(
  userPresets: Map<string, SessionPreset>,
): string {
  const presets = Array.from(userPresets.values());
  return JSON.stringify(presets, null, 2);
}

export async function buildImportPresets(
  jsonData: string,
  userId: string,
  userPresets: Map<string, SessionPreset>,
  updatePreset: (
    presetId: string,
    updates: Partial<Omit<SessionPreset, "id" | "createdAt" | "userId">>,
  ) => Promise<SessionPreset>,
  createPreset: (
    presetData: Omit<SessionPreset, "id" | "createdAt" | "updatedAt" | "userId">,
  ) => Promise<SessionPreset>,
): Promise<number> {
  if (!userId) {
    throw new Error("PresetService: No user set");
  }
  try {
    const presets = JSON.parse(jsonData) as SessionPreset[];
    let imported = 0;
    for (const preset of presets) {
      try {
        const validation = ValidateSessionPresetSchema.safeParse(preset);
        if (!validation.success) {
          continue;
        }
        const existing = Array.from(userPresets.values()).find(
          (p) => p.name === preset.name,
        );
        if (existing) {
          await updatePreset(existing.id, preset);
        } else {
          await createPreset({
            name: preset.name,
            description: preset.description,
            duration: preset.duration,
            breakDuration: preset.breakDuration,
            longBreakDuration: preset.longBreakDuration,
            intervals: preset.intervals,
            longBreakInterval: preset.longBreakInterval,
            isDefault: false,
            category: preset.category,
            tags: preset.tags,
            soundEnabled: preset.soundEnabled,
            vibrationEnabled: preset.vibrationEnabled,
            dndEnabled: preset.dndEnabled,
            strictMode: preset.strictMode,
            autoStartBreaks: preset.autoStartBreaks,
            autoStartNextInterval: preset.autoStartNextInterval,
          });
        }
        imported++;
      } catch (error) {
        debug.error("Failed to import preset", error as Error);
      }
    }
    debug.info("Imported %d presets", imported);
    return imported;
  } catch (error) {
    throw new Error(`Failed to import presets: ${(error as Error).message}`);
  }
}
