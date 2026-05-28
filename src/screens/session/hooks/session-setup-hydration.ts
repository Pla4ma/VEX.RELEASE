import { captureSilentFailure } from "../../../utils/silent-failure";
import type { MasteryState } from "../../../features/mastery/types";
import type { SessionStackParams } from "../../../navigation/types";
import type { MMKVStorageAdapter } from "../../../persistence/MMKVStorageAdapter";
import {
  hydrateMasteryState,
  MasteryStateSchema,
  PRESETS,
  resolveSmartSuggestion,
  SESSION_DRAFT_MAX_AGE_MS,
  SessionDraftSchema,
  type PresetWithIcon,
  type SmartSuggestion,
} from "../utils/session-setup";

type SessionSetupParams = SessionStackParams["SessionSetup"];

export interface RestoredDraftData {
  masteryState: MasteryState | null;
  smartSuggestion: SmartSuggestion | null;
  hasSavedDraft: boolean;
  presetOverride: PresetWithIcon | null;
  categoryOverride: string | null;
  customDurationOverride: number | null;
  themeIdOverride: string | null;
  goalOverride: string | null;
  showAdvancedOverride: boolean | null;
  showCustomizationOverride: boolean | null;
}

const EMPTY_RESTORE: RestoredDraftData = {
  masteryState: null,
  smartSuggestion: null,
  hasSavedDraft: false,
  presetOverride: null,
  categoryOverride: null,
  customDurationOverride: null,
  themeIdOverride: null,
  goalOverride: null,
  showAdvancedOverride: null,
  showCustomizationOverride: null,
};

export async function restoreSessionDraft(
  storage: MMKVStorageAdapter,
  sessionDraftKey: string,
  masteryStateKey: string,
  userId: string,
  currentStreak: number,
  params: SessionSetupParams | undefined,
): Promise<RestoredDraftData> {
  if (!userId) {
    return EMPTY_RESTORE;
  }
  try {
    const rawDraft = await storage.getItem(sessionDraftKey);
    const rawMastery = await storage.getItem(masteryStateKey);
    const parsedMastery = rawMastery
      ? MasteryStateSchema.safeParse(JSON.parse(rawMastery) as unknown)
      : null;
    const masteryState = parsedMastery?.success
      ? hydrateMasteryState(parsedMastery.data, userId)
      : null;
    const smartSuggestion = resolveSmartSuggestion(
      parsedMastery?.success ? parsedMastery.data : null,
      currentStreak,
    );
    if (!rawDraft) {
      return { ...EMPTY_RESTORE, masteryState, smartSuggestion };
    }
    const parsedDraft = SessionDraftSchema.safeParse(
      JSON.parse(rawDraft) as unknown,
    );
    if (!parsedDraft.success) {
      await storage.removeItem(sessionDraftKey);
      return { ...EMPTY_RESTORE, masteryState, smartSuggestion };
    }
    if (Date.now() - parsedDraft.data.savedAt > SESSION_DRAFT_MAX_AGE_MS) {
      await storage.removeItem(sessionDraftKey);
      return { ...EMPTY_RESTORE, masteryState, smartSuggestion };
    }
    const matchedPreset = PRESETS.find(
      (preset) => preset.id === parsedDraft.data.presetId,
    );
    const hasRoutedDuration = Boolean(
      params?.presetDuration ?? params?.suggestedDurationSeconds,
    );
    const presetOverride =
      matchedPreset && !params?.presetId && !hasRoutedDuration
        ? matchedPreset
        : null;
    const categoryOverride =
      !params?.presetId && !hasRoutedDuration
        ? parsedDraft.data.selectedCategory
        : null;
    const customDurationOverride =
      !params?.presetId && !hasRoutedDuration
        ? parsedDraft.data.customDuration
        : null;
    const themeIdOverride = params?.selectedThemeId
      ? null
      : parsedDraft.data.selectedThemeId;
    const goalOverride = params?.goal ? null : parsedDraft.data.goal;
    const showAdvancedOverride = parsedDraft.data.showAdvanced;
    const showCustomizationOverride =
      parsedDraft.data.presetId !== PRESETS[1]!.id ||
      parsedDraft.data.selectedThemeId !== "default" ||
      parsedDraft.data.showAdvanced
        ? true
        : null;
    return {
      masteryState,
      smartSuggestion,
      hasSavedDraft: true,
      presetOverride,
      categoryOverride,
      customDurationOverride,
      themeIdOverride,
      goalOverride,
      showAdvancedOverride,
      showCustomizationOverride,
    };
  } catch (error) {
    captureSilentFailure(error, {
      feature: "screens",
      operation: "network-fallback",
      type: "network",
    });
    try {
      await storage.removeItem(sessionDraftKey);
    } catch (removeError) {
      captureSilentFailure(removeError, {
        feature: "screens",
        operation: "network-fallback",
        type: "network",
      });
    }
    return EMPTY_RESTORE;
  }
}

export async function saveSessionDraft(
  storage: MMKVStorageAdapter,
  sessionDraftKey: string,
  draft: {
    presetId: string;
    selectedCategory: string;
    customDuration: number;
    selectedThemeId: string;
    showAdvanced: boolean;
    goal: string | undefined;
  },
): Promise<void> {
  try {
    const draftPayload = SessionDraftSchema.parse({
      savedAt: Date.now(),
      ...draft,
    });
    await storage.setItem(sessionDraftKey, JSON.stringify(draftPayload));
  } catch (error) {
    captureSilentFailure(error, {
      feature: "screens",
      operation: "network-fallback",
      type: "network",
    });
  }
}
